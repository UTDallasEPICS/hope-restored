import { defineEventHandler } from 'h3';
import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) => {
  try {
    // Find the earliest date in InventoryRecords
    const firstRecord = await prisma.inventoryRecords.findFirst({
      orderBy: {
        date: 'asc'
      },
      select: {
        date: true
      }
    });

    if (!firstRecord) {
      // If no records exist, return null
      return { firstDate: null };
    }

    // Return the date as ISO string
    return { firstDate: firstRecord.date.toISOString() };
  } catch (error) {
    console.error('Error fetching first inventory date:', error);
    throw error;
  }
});
