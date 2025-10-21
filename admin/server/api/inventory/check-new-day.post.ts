import { defineEventHandler } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/inventory/check-new-day
// Checks if today's InventoryRecords exist, creates them if not
export default defineEventHandler(async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

  // Check if InventoryRecords for today already exist
  const existingRecords = await prisma.inventoryRecords.findMany({
    where: {
      date: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  // If records already exist, no need to create new ones
  if (existingRecords.length > 0) {
    return {
      status: 'ok',
      message: 'Today\'s records already exist',
      recordsCreated: false,
      date: startOfDay.toISOString(),
    };
  }

  // Get all categories
  const categories = await prisma.itemCategory.findMany({
    orderBy: { name: 'asc' },
  });

  // For each category, find the most recent InventoryRecord and copy its quantity
  const newRecords = [];
  for (const category of categories) {
    // Find the most recent record for this category
    const previousRecord = await prisma.inventoryRecords.findFirst({
      where: { category: category.name },
      orderBy: { date: 'desc' },
    });

    const quantity = previousRecord?.quantity ?? 0;

    // Create today's record
    const newRecord = await prisma.inventoryRecords.create({
      data: {
        category: category.name,
        quantity,
        date: startOfDay,
      },
    });

    newRecords.push(newRecord);
  }

  return {
    status: 'ok',
    message: `Created ${newRecords.length} new records for today`,
    recordsCreated: true,
    date: startOfDay.toISOString(),
    count: newRecords.length,
  };
});
