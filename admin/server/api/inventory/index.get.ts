import { defineEventHandler, getQuery } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the function that handles the request
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const start = query.start ? new Date(query.start as string) : null;  
  const end = query.end ? new Date(query.end as string) : null;

  // Build where clause to filter by today's date if provided
  const where: any = {};
  if (start && end) {
    where.date = {
      gte: start,
      lt: end,
    };
  }

  // Aggregate totals by category from InventoryRecords for today only
  const rows = await prisma.inventoryRecords.groupBy({
    by: ['category'],
    where,
    _sum: { quantity: true },
  });

  // Map to a consistent shape for the front-end
  return rows.map(r => ({
    category: { name: r.category },
    quantity: r._sum.quantity ?? 0,
  }));
});