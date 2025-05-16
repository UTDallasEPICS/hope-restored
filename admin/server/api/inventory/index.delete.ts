import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the function that handles the request
export default defineEventHandler(async (event) => {
  // Read the request body (entry data)
  const entry = await readBody(event);

  const inventory = await prisma.inventory.delete({
    where: { barcode: entry.barcode },
  });

  return inventory;
});