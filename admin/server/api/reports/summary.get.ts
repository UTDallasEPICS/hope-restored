import { defineEventHandler, getQuery } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/reports/summary?start=ISO&end=ISO
// Returns per-category: { category, total, added, removed }
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const start = query.start ? new Date(String(query.start)) : null;
  const end = query.end ? new Date(String(query.end)) : null;

  // Default to today (server local) if no range provided
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const rangeStart = start || startOfDay;
  const rangeEnd = end || endOfDay;

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

  // Construct output in canonical order; include any extra categories if present
  const seen = new Set<string>();
  const result: Array<{ category: string; total: number; added: number; removed: number }> = [];
  for (const cat of order) {
    result.push({
      category: cat,
      total: Number(totalsMap.get(cat) || 0),
      added: Number(addsMap.get(cat) || 0),
      removed: Number(removesMap.get(cat) || 0),
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
      total: Number(totalsMap.get(cat) || 0),
      added: Number(addsMap.get(cat) || 0),
      removed: Number(removesMap.get(cat) || 0),
    });
  }

  return result;
});
