import { defineEventHandler, getQuery } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/reports/summary?start=ISO&end=ISO
// Returns per-category: { category, total, added, removed }
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  let rangeStart: Date;
  let rangeEnd: Date;

  // Handle different query parameter formats
  if (query.date) {
    // Daily report: ?date=YYYY-MM-DD
    const d = new Date(String(query.date));
    rangeStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    rangeEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
  } else if (query.year && query.month) {
    // Monthly report: ?year=YYYY&month=MM
    const year = Number(query.year);
    const month = Number(query.month) - 1; // month is 1-based in query, 0-based in Date
    rangeStart = new Date(year, month, 1, 0, 0, 0, 0);
    rangeEnd = new Date(year, month + 1, 1, 0, 0, 0, 0);
  } else if (query.start && query.end) {
    // Weekly or custom range: ?start=ISO&end=ISO
    rangeStart = new Date(String(query.start));
    rangeEnd = new Date(String(query.end));
  } else {
    // Default to today (server local) if no range provided
    const now = new Date();
    rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  }

  // Canonical category order
  const order = ['Shirts', 'Pants', 'Jackets', 'Underwear', 'Shoes', 'Snack Packs', 'Hygiene Packs'];

  // Aggregate totals from InventoryRecords (today only)
  const totalRows = await prisma.inventoryRecords.groupBy({
    by: ['category'],
    where: { date: { gte: rangeStart, lt: rangeEnd } },
    _sum: { quantity: true },
  });

  // Aggregate additions for the day
  const addRows = await prisma.additions.groupBy({
    by: ['category'],
    where: { dateAdded: { gte: rangeStart, lt: rangeEnd } },
    _sum: { quantity: true },
  });

  // Aggregate removals for the day
  const removeRows = await prisma.removals.groupBy({
    by: ['category'],
    where: { dateRemoved: { gte: rangeStart, lt: rangeEnd } },
    _sum: { quantity: true },
  });

  // Build lookup maps
  const totalsMap = new Map(totalRows.map(r => [r.category, r._sum.quantity ?? 0]));
  const addsMap = new Map(addRows.map(r => [r.category, r._sum.quantity ?? 0]));
  const removesMap = new Map(removeRows.map(r => [r.category, r._sum.quantity ?? 0]));

  // Check if there's any data at all for this date range
  const hasAnyData = totalRows.length > 0 || addRows.length > 0 || removeRows.length > 0;

  // Construct output in canonical order; include any extra categories if present
  const seen = new Set<string>();
  const result: Array<{ category: string; total: number | string; added: number | string; removed: number | string }> = [];
  for (const cat of order) {
    result.push({
      category: cat,
      total: hasAnyData ? Number(totalsMap.get(cat) || 0) : 'N/A',
      added: hasAnyData ? Number(addsMap.get(cat) || 0) : 'N/A',
      removed: hasAnyData ? Number(removesMap.get(cat) || 0) : 'N/A',
    });
    seen.add(cat);
  }

  // Append any categories outside the canonical list
  const extras = new Set<string>([
    ...totalRows.map(r => r.category),
    ...addRows.map(r => r.category),
    ...removeRows.map(r => r.category),
  ]);
  for (const cat of extras) {
    if (seen.has(cat)) continue;
    result.push({
      category: cat,
      total: hasAnyData ? Number(totalsMap.get(cat) || 0) : 'N/A',
      added: hasAnyData ? Number(addsMap.get(cat) || 0) : 'N/A',
      removed: hasAnyData ? Number(removesMap.get(cat) || 0) : 'N/A',
    });
  }

  return result;
});
