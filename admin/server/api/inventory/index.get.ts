import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the function that handles the request
export default defineEventHandler(async () => {
  // Aggregate totals by category from InventoryRecords (the source of truth)
  const rows = await prisma.inventoryRecords.groupBy({
    by: ['category'],
    _sum: { quantity: true },
  });

  // Map to a consistent shape for the front-end
  return rows.map(r => ({
    category: { name: r.category },
    quantity: r._sum.quantity ?? 0,
  }));
});