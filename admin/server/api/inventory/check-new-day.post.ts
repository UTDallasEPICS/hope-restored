// check-new-day.post.ts

import { defineEventHandler } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/inventory/check-new-day
// Checks if today's InventoryRecords exist, creates them if not
// Also fills in any missing days between the last record and today
export default defineEventHandler(async () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // Get all categories
  const categories = [
    { name: 'Shirts' },
    { name: 'Pants' },
    { name: 'Shoes' },
    { name: 'Underwear' },
    { name: 'Jackets' },
    { name: 'Snack Packs' },
    { name: 'Hygiene Packs' },
    { name: 'Blankets' }
  ];

  // Find the most recent date that has any records
  const mostRecentRecord = await prisma.inventoryRecords.findFirst({
    orderBy: { date: 'desc' },
    select: { date: true },
  });

  if (!mostRecentRecord) {
    // No records exist at all - create records for today only
    const newRecords = [];
    for (const category of categories) {
      const newRecord = await prisma.inventoryRecords.create({
        data: {
          category: category.name,
          quantity: 0,
          date: today,
        },
      });
      newRecords.push(newRecord);
    }

    return {
      status: 'ok',
      message: `Created ${newRecords.length} initial records for today`,
      recordsCreated: true,
      date: today.toISOString(),
      count: newRecords.length,
      daysCreated: 1,
    };
  }

  // Get the most recent date (normalize to midnight)
  const lastDate = new Date(mostRecentRecord.date);
  const lastDateStart = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 0, 0, 0, 0);

  // Check if we're already up to date
  if (lastDateStart.getTime() >= today.getTime()) {
    return {
      status: 'ok',
      message: 'Today\'s records already exist',
      recordsCreated: false,
      date: today.toISOString(),
    };
  }

  // Fill in missing days from lastDate + 1 day up to and including today
  const daysToCreate: Date[] = [];
  let currentDate = new Date(lastDateStart);
  currentDate.setDate(currentDate.getDate() + 1); // Start from the day after the last record

  while (currentDate <= today) {
    daysToCreate.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  let totalRecordsCreated = 0;
  const createdDates: string[] = [];

  // For each missing day, create records for all categories
  for (const dateToCreate of daysToCreate) {
    const dayStart = new Date(dateToCreate.getFullYear(), dateToCreate.getMonth(), dateToCreate.getDate(), 0, 0, 0, 0);
    const dayEnd = new Date(dateToCreate.getFullYear(), dateToCreate.getMonth(), dateToCreate.getDate() + 1, 0, 0, 0, 0);

    // Check if records already exist for this day (safety check)
    const existingForDay = await prisma.inventoryRecords.findFirst({
      where: {
        date: { gte: dayStart, lt: dayEnd },
      },
    });

    if (existingForDay) {
      continue; // Skip if records already exist for this day
    }

    // For each category, find the most recent record before this date
    for (const category of categories) {
      const previousRecord = await prisma.inventoryRecords.findFirst({
        where: {
          category: category.name,
          date: { lt: dayStart },
        },
        orderBy: { date: 'desc' },
      });

      const quantity = previousRecord?.quantity ?? 0;

      await prisma.inventoryRecords.create({
        data: {
          category: category.name,
          quantity,
          date: dayStart,
        },
      });

      totalRecordsCreated++;
    }

    createdDates.push(dayStart.toISOString().split('T')[0]);
  }

  return {
    status: 'ok',
    message: `Created ${totalRecordsCreated} records across ${daysToCreate.length} missing day(s)`,
    recordsCreated: true,
    date: today.toISOString(),
    count: totalRecordsCreated,
    daysCreated: daysToCreate.length,
    dates: createdDates,
  };
});
