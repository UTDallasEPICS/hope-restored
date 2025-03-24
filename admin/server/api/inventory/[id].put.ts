import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the function that handles the request
export default defineEventHandler(async (event) => {
  // Read the request body (entry data)
  const entry = await readBody(event);

  // error if item does not exist
  if (!(entry.barcode && entry.quantity)) return createError({ statusCode: 400, statusMessage: "Item does not exist in inventory" });

  if (entry.barcode && entry.quantity) {
    const item = await prisma.inventory.update({
        where: {
            barcode: entry.barcode,
        },
        data: {
            quantity: {
                increment: entry.quantity,
            }
        }
    }); 
  }
})
