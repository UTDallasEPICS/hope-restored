import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBlankets() {
  try {
    const blankets = await prisma.inventoryRecords.findMany({
      where: { category: 'Blankets' },
      orderBy: { date: 'asc' }
    });
    
    console.log('Total Blankets records:', blankets.length);
    
    if (blankets.length > 0) {
      console.log('First record date:', blankets[0].date.toISOString().split('T')[0]);
      console.log('Last record date:', blankets[blankets.length - 1].date.toISOString().split('T')[0]);
      console.log('\nFirst 5 records:');
      blankets.slice(0, 5).forEach(r => {
        console.log(`  ${r.date.toISOString().split('T')[0]}: quantity = ${r.quantity}`);
      });
    } else {
      console.log('NO BLANKETS RECORDS FOUND!');
    }
    
    // Also check all dates
    const allDates = await prisma.inventoryRecords.findMany({
      where: { category: 'Shirts' },
      orderBy: { date: 'asc' },
      select: { date: true }
    });
    
    console.log('\nTotal dates with records (using Shirts as reference):', allDates.length);
    if (allDates.length > 0) {
      console.log('First date:', allDates[0].date.toISOString().split('T')[0]);
      console.log('Last date:', allDates[allDates.length - 1].date.toISOString().split('T')[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBlankets();
