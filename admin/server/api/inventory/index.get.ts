import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the function that handles the request
export default defineEventHandler(async () => {

    return await prisma.inventory.findMany({
        select: {
            barcode: true,
            quantity: true,
            category: {
                select: {
                    name: true
                }
            },
            style: {
                select: {
                    name: true
                }
            },
            size: {
                select: {
                    sizeCode: true
                }
            },
            gender: {
                select: {
                    name: true
                }
            },
        }
    });

});