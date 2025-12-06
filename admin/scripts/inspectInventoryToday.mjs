#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const nextDay = new Date(startOfDay);
    nextDay.setDate(startOfDay.getDate() + 1);
    const dayStr = startOfDay.toISOString().slice(0,10);

    const rows = await prisma.inventoryRecords.findMany({ where: { date: { gte: startOfDay, lt: nextDay } }, orderBy: { category: 'asc' } });
    console.log(`InventoryRecords for ${dayStr} (server local timezone):`);
    if (!rows.length) console.log('  (none)');
    for (const r of rows) {
      console.log(`  id=${r.id} category=${r.category} qty=${r.quantity} date=${r.date.toISOString()}`);
    }
  } catch (err) {
    console.error('Inspect error:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

run();
