import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBlanketsToday() {
  try {
    const today = new Date(2025, 10, 6, 0, 0, 0, 0); // November is month 10 (0-indexed)
    const record = await prisma.inventoryRecords.findFirst({
      where: { category: 'Blankets', date: today }
    });
    console.log('Today Blankets record:', record);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBlanketsToday();
