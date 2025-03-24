import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the function that handles the request
export default defineEventHandler(async (event) => {

    // Read the barcode
    const { id } = event.context.params;

    return await prisma.inventory.findUnique({
        where: { barcode: id }
    });

    console.log("Fetching from get item API!");

});