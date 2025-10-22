#!/usr/bin/env node
// resetInventoryData.mjs
// Clears all data from InventoryRecords, Additions, and Removals tables

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Resetting inventory data...');
    
    // Count records before deletion
    const recordsCount = await prisma.inventoryRecords.count();
    const additionsCount = await prisma.additions.count();
    const removalsCount = await prisma.removals.count();
    
    console.log(`Found:`);
    console.log(`  - ${recordsCount} InventoryRecords`);
    console.log(`  - ${additionsCount} Additions`);
    console.log(`  - ${removalsCount} Removals`);
    
    // Delete all data
    await prisma.inventoryRecords.deleteMany({});
    console.log('✓ Deleted all InventoryRecords');
    
    await prisma.additions.deleteMany({});
    console.log('✓ Deleted all Additions');
    
    await prisma.removals.deleteMany({});
    console.log('✓ Deleted all Removals');
    
    // Reset auto-increment counters (SQLite specific)
    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name='InventoryRecords'`);
    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name='Additions'`);
    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name='Removals'`);
    console.log('✓ Reset auto-increment counters');
    
    console.log('\n✅ All inventory data cleared successfully!');
    console.log('💡 Run "npm run newDay" to create fresh InventoryRecords for today.');

  } catch (err) {
    console.error('❌ Reset error:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

run();
