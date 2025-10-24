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
    // Parse date string as local date, not UTC
    const dateStr = String(query.date);
    const [year, month, day] = dateStr.split('-').map(Number);
    rangeStart = new Date(year, month - 1, day, 0, 0, 0, 0);
    rangeEnd = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
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

  // For inventory totals, get only the LAST day's inventory in the range
  // Find the most recent date with InventoryRecords in the range
  const lastDateRecord = await prisma.inventoryRecords.findFirst({
    where: { date: { gte: rangeStart, lt: rangeEnd } },
    orderBy: { date: 'desc' },
    select: { date: true },
  });

  type InventoryGroupBy = { category: string; _sum: { quantity: number | null } };
  let totalRows: InventoryGroupBy[] = [];
  if (lastDateRecord) {
    // Get only records from the last day in the range
    const lastDate = lastDateRecord.date;
    const lastDayStart = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 0, 0, 0, 0);
    const lastDayEnd = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1, 0, 0, 0, 0);
    
    // @ts-expect-error - Prisma groupBy return type inference issue
    totalRows = await prisma.inventoryRecords.groupBy({
      by: ['category'],
      where: { date: { gte: lastDayStart, lt: lastDayEnd } },
      _sum: { quantity: true },
    });
  }

  // Aggregate additions for the entire date range
  const addRows = await prisma.additions.groupBy({
    by: ['category'],
    where: { dateAdded: { gte: rangeStart, lt: rangeEnd } },
    _sum: { quantity: true },
  });

  // Aggregate removals for the entire date range
  const removeRows = await prisma.removals.groupBy({
    by: ['category'],
    where: { dateRemoved: { gte: rangeStart, lt: rangeEnd } },
    _sum: { quantity: true },
  });

  // Build lookup maps
  const totalsMap = new Map(totalRows.map(r => [r.category, r._sum.quantity ?? 0]));
  const addsMap = new Map(addRows.map(r => [r.category, r._sum.quantity ?? 0]));
  const removesMap = new Map(removeRows.map(r => [r.category, r._sum.quantity ?? 0]));

  // Check if there's any InventoryRecords for this date range
  // If no InventoryRecords exist, the day hasn't been set up yet, show N/A
  const hasInventoryRecords = totalRows.length > 0;

  // Construct output in canonical order; include any extra categories if present
  const seen = new Set<string>();
  const result: Array<{ category: string; total: number | string; added: number | string; removed: number | string }> = [];
  for (const cat of order) {
    result.push({
      category: cat,
      total: hasInventoryRecords ? Number(totalsMap.get(cat) || 0) : 'N/A',
      added: hasInventoryRecords ? Number(addsMap.get(cat) || 0) : 'N/A',
      removed: hasInventoryRecords ? Number(removesMap.get(cat) || 0) : 'N/A',
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
      total: hasInventoryRecords ? Number(totalsMap.get(cat) || 0) : 'N/A',
      added: hasInventoryRecords ? Number(addsMap.get(cat) || 0) : 'N/A',
      removed: hasInventoryRecords ? Number(removesMap.get(cat) || 0) : 'N/A',
    });
  }

  return result;
});
