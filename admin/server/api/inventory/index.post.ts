import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function capitalizeFirst(s: string | null | undefined): string | null | undefined {
  if (s == null || s === '') return s;
  const t = String(s).trim();
  return t === '' ? t : t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

export default defineEventHandler(async (event) => {
  const entry = await readBody(event);
  try {
    const rawCategory = String(entry.category ?? '').trim();
    const category = rawCategory === 'Other Items' ? 'Other Items' : (capitalizeFirst(entry.category) ?? entry.category);
    const size = entry.size != null && entry.size !== '' ? capitalizeFirst(entry.size) ?? entry.size : entry.size;
    const gender = entry.gender != null && entry.gender !== '' ? capitalizeFirst(entry.gender) ?? entry.gender : entry.gender;
    const invCode = category + size + gender;
    await prisma.inventory.upsert({
      where: { code: invCode },
      create: {
        code: invCode,
        category,
        gender,
        size,
        quantity: entry.quantity,
      },
      update: {
        quantity: { increment: entry.quantity },
      },
    });
    return { success: true };
  }
  catch (error) {
    console.error('Error inserting data:', error);
    return {
      error: 'An error occurred while inserting data.',
    };
  }
})