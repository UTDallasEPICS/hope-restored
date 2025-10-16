import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: find category by name robustly (case-insensitive, trim, simple plural/singular match)
async function findCategoryByName(client: PrismaClient | any, name: string) {
  if (!name) return null;
  const raw = String(name).trim();
  if (!raw) return null;
  // direct exact match first
  let cat = await client.itemCategory.findUnique({ where: { name: raw } });
  if (cat) return cat;

  // fetch all categories and try case-insensitive matches and simple plural/singular variants
  const all: Array<{ name: string }> = await client.itemCategory.findMany();
  const lower = raw.toLowerCase();
  cat = all.find((c: { name: string }) => c.name.trim().toLowerCase() === lower) || null;
  if (cat) return cat;

  // try removing trailing 's' (simple singular) or adding 's'
  if (lower.endsWith('s')) {
    const singular = lower.slice(0, -1);
  cat = all.find((c: { name: string }) => c.name.trim().toLowerCase() === singular) || null;
    if (cat) return cat;
  } else {
    const plural = lower + 's';
  cat = all.find((c: { name: string }) => c.name.trim().toLowerCase() === plural) || null;
    if (cat) return cat;
  }

  return null;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const removals = body?.removals || [];

  if (!Array.isArray(removals) || removals.length === 0) {
    return { success: false, error: 'No removals supplied' };
  }

  const resultLines: string[] = [];

  try {
    // Pre-check: ensure requested quantities do not exceed available inventory
    const insufficient: Array<{ category: string; requested: number; available: number }> = [];
    for (const entry of removals) {
      const categoryName = entry.category;
      const requested = Number(entry.quantity) || 0;
      if (!categoryName || requested <= 0) continue;

      // Case-insensitive category lookup to avoid mismatch due to casing
        // Robust category lookup
        const category = await findCategoryByName(prisma, categoryName);
      if (!category) {
        insufficient.push({ category: categoryName, requested, available: 0 });
        continue;
      }

      // Use InventoryRecords as the source of truth for available stock
      const agg = await prisma.inventoryRecords.aggregate({ where: { category: category.name }, _sum: { quantity: true } });
      const available = agg._sum.quantity ?? 0;
      if (requested > available) insufficient.push({ category: categoryName, requested, available });
    }

    if (insufficient.length > 0) {
      return { success: false, error: 'Insufficient inventory for one or more categories', details: insufficient };
    }

    // All checks passed — perform removals inside a transaction for consistency
    await prisma.$transaction(async (tx) => {
      for (const entry of removals) {
        const categoryName = entry.category;
        let remainingToRemove = Number(entry.quantity) || 0;
        if (!categoryName || remainingToRemove <= 0) continue;
        // Use case-insensitive lookup inside transaction and re-check availability to avoid race conditions
          // Robust lookup inside the transaction and re-check availability to avoid race conditions
          const category = await findCategoryByName(tx, categoryName);
        if (!category) {
          resultLines.push(`Category not found: ${categoryName}`);
          continue;
        }
        // Re-check availability from InventoryRecords inside the transaction
        const agg = await tx.inventoryRecords.aggregate({ where: { category: category.name }, _sum: { quantity: true } });
        const available = agg._sum.quantity ?? 0;
        if (remainingToRemove > available) {
          throw new Error(`Insufficient inventory for ${categoryName}: requested ${remainingToRemove}, available ${available}`);
        }
        // Consume InventoryRecords FIFO (oldest first)
        const recordRows = await tx.inventoryRecords.findMany({ where: { category: category.name }, orderBy: { date: 'asc' } });
        let totalRemoved = 0;
        let needed = remainingToRemove;
        for (const rec of recordRows) {
          if (needed <= 0) break;
          const take = Math.min(needed, rec.quantity);
          if (take <= 0) continue;
          if (take >= rec.quantity) {
            // consume entire record
            await tx.inventoryRecords.delete({ where: { id: rec.id } });
          } else {
            await tx.inventoryRecords.update({ where: { id: rec.id }, data: { quantity: { decrement: take } } });
          }
          needed -= take;
          totalRemoved += take;
        }

        // Sanity: totalRemoved should equal remainingToRemove now
        if (totalRemoved !== remainingToRemove) {
          throw new Error(`Could not consume requested quantity for ${categoryName}. Removed ${totalRemoved} expected ${remainingToRemove}`);
        }

        // Also decrement Inventory aggregated rows to keep inventory table in sync
        let remainingToDecrement = totalRemoved;
        const invRows = await tx.inventory.findMany({ where: { categoryId: category.id }, orderBy: { quantity: 'desc' } });
        for (const row of invRows) {
          if (remainingToDecrement <= 0) break;
          const take = Math.min(remainingToDecrement, row.quantity);
          if (take <= 0) continue;
          await tx.inventory.update({ where: { barcode: row.barcode }, data: { quantity: { decrement: take } } });
          remainingToDecrement -= take;
        }

        await tx.removals.create({ data: { category: categoryName, dateRemoved: new Date(), quantity: totalRemoved } });
        resultLines.push(`Removed ${totalRemoved} ${categoryName}`);
      }
    });

    return { success: true, lines: resultLines };
  } catch (err) {
    console.error('Checkout error:', err);
    return { success: false, error: String(err) };
  }
});
