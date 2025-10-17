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
    // Build a map of requested totals per canonical category name to handle multiple lines for same category
    const requestedMap = new Map<string, number>();
    const lookupMap = new Map<string, { inputName: string; categoryName: string }>();
    for (const entry of removals) {
      const inputName = entry.category;
      const requested = Number(entry.quantity) || 0;
      if (!inputName || requested <= 0) continue;
      const category = await findCategoryByName(prisma, inputName);
      const canonical = category ? category.name : inputName;
      lookupMap.set(canonical, { inputName, categoryName: canonical });
      requestedMap.set(canonical, (requestedMap.get(canonical) || 0) + requested);
    }

    const insufficient: Array<{ category: string; requested: number; available: number }> = [];
    // Query available totals for all involved categories in parallel
    const categoriesToCheck = Array.from(requestedMap.keys());
    if (categoriesToCheck.length > 0) {
      const aggs = await Promise.all(
        categoriesToCheck.map((cat) =>
          prisma.inventoryRecords.aggregate({ where: { category: cat }, _sum: { quantity: true } })
        )
      );

      for (let i = 0; i < categoriesToCheck.length; i++) {
        const cat = categoriesToCheck[i];
        const requested = requestedMap.get(cat) || 0;
        const available = aggs[i]._sum.quantity ?? 0;
        if (requested > available) {
          const original = lookupMap.get(cat)?.inputName || cat;
          insufficient.push({ category: original, requested, available });
        }
      }
    }

    if (insufficient.length > 0) {
      return { success: false, error: 'Insufficient inventory for one or more categories', details: insufficient };
    }

    // All checks passed — perform removals inside a transaction for consistency
    // Perform removals inside a single transaction. Use the grouped requestedMap so multiple lines for same category are consumed once.
    await prisma.$transaction(async (tx) => {
      for (const [canonicalCategory, totalRequested] of requestedMap.entries()) {
        if (!canonicalCategory || totalRequested <= 0) continue;
        // re-check availability inside transaction
        const agg = await tx.inventoryRecords.aggregate({ where: { category: canonicalCategory }, _sum: { quantity: true } });
        const available = agg._sum.quantity ?? 0;
        if (totalRequested > available) {
          throw new Error(`Insufficient inventory for ${canonicalCategory}: requested ${totalRequested}, available ${available}`);
        }

        // Consume InventoryRecords FIFO (oldest first) until totalRequested satisfied
        let needed = totalRequested;
        const recordRows = await tx.inventoryRecords.findMany({ where: { category: canonicalCategory }, orderBy: { date: 'asc' } });
        let totalRemoved = 0;
        for (const rec of recordRows) {
          if (needed <= 0) break;
          const take = Math.min(needed, rec.quantity);
          if (take <= 0) continue;
          if (take >= rec.quantity) {
            await tx.inventoryRecords.delete({ where: { id: rec.id } });
          } else {
            await tx.inventoryRecords.update({ where: { id: rec.id }, data: { quantity: { decrement: take } } });
          }
          needed -= take;
          totalRemoved += take;
        }

        if (totalRemoved !== totalRequested) {
          throw new Error(`Could not consume requested quantity for ${canonicalCategory}. Removed ${totalRemoved} expected ${totalRequested}`);
        }

        // Also decrement Inventory aggregated rows to keep inventory table in sync (best-effort)
        let remainingToDecrement = totalRemoved;
        // find matching inventory rows by category relation
        const categoryRow = await tx.itemCategory.findUnique({ where: { name: canonicalCategory } });
        if (categoryRow) {
          const invRows = await tx.inventory.findMany({ where: { categoryId: categoryRow.id }, orderBy: { quantity: 'desc' } });
          for (const row of invRows) {
            if (remainingToDecrement <= 0) break;
            const take = Math.min(remainingToDecrement, row.quantity);
            if (take <= 0) continue;
            await tx.inventory.update({ where: { barcode: row.barcode }, data: { quantity: { decrement: take } } });
            remainingToDecrement -= take;
          }
        }

        // Record Removals history with the input name if available
        const inputName = lookupMap.get(canonicalCategory)?.inputName || canonicalCategory;
        await tx.removals.create({ data: { category: inputName, dateRemoved: new Date(), quantity: totalRemoved } });
        resultLines.push(`Removed ${totalRemoved} ${inputName}`);
      }
    });

    return { success: true, lines: resultLines };
  } catch (err) {
    console.error('Checkout error:', err);
    return { success: false, error: String(err) };
  }
});
