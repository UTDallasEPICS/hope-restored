#!/usr/bin/env node
// dailyInventorySnapshot.mjs
// Creates a daily InventoryRecords row for each category if missing for today,
// copying the last-known total. Uses server-local timezone (Central Daylight Time by user's request).

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Starting daily inventory snapshot (server local timezone)...');
    const now = new Date();
    // Use local server date boundaries (assumed to be CDT on your machine)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const nextDay = new Date(startOfDay);
    nextDay.setDate(startOfDay.getDate() + 1);

    // canonical list of categories to ensure we cover the seven desired
    const categories = ['Shirts','Pants','Jackets','Underwear','Shoes','Snack Packs','Hygiene Packs'];

    for (const catName of categories) {
      // check if there's already a row for today for this category
      const existing = await prisma.inventoryRecords.findFirst({ where: { category: catName, date: { gte: startOfDay, lt: nextDay } } });
      if (existing) {
        console.log(`Category ${catName}: already has a record for today (id=${existing.id}).`);
        continue;
      }

      // find last known total for this category (sum of all InventoryRecords before nextDay)
      const agg = await prisma.inventoryRecords.aggregate({ where: { category: catName, date: { lt: nextDay } }, _sum: { quantity: true } });
      const lastTotal = agg._sum.quantity ?? 0;

      // create today's row with lastTotal
      const created = await prisma.inventoryRecords.create({ data: { date: now, category: catName, quantity: lastTotal } });
      console.log(`Inserted snapshot for ${catName} => quantity=${lastTotal} (id=${created.id})`);
    }

    console.log('Daily snapshot complete.');
  } catch (err) {
    console.error('Snapshot error:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

run();
