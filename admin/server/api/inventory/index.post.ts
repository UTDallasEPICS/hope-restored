import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default defineEventHandler(async (event) => {
  const entry = await readBody(event);
  try {
      const invCode = entry.category + entry.size + entry.gender
      let additionRecord = null;
      try {
        // Normalize to start of day (local timezone) for consistent date filtering
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        
        //additions table shows all items that have arrived - even if removed from inventory
        additionRecord = await prisma.additions.upsert({
          where:{code:invCode},
          create: {
            code:invCode,
            category: entry.category,
            gender: entry.gender,
            size: entry.size,
            dateAdded: startOfDay,
            quantity: entry.quantity,
          },
          update: {
            quantity:entry.quantity
          }
        });

        // Also create or update an Inventory entry to represent available stock of each category
        try {
           const inv = await prisma.inventory.upsert({
            where:{code:invCode},
            create:{
              code: invCode,
              category: entry.category,
              gender: entry.gender,
              size: entry.size,
              quantity: entry.quantity
            },
            update:{
              quantity:{
                increment:entry.quantity
              }
            }
          })
        } catch (recErr) {
          console.error('Error recording inventory record:', recErr);
        }
      } catch (addErr) {
        console.error('Error recording addition:', addErr);
      }

      console.log('Data inserted successfully!');
      return { success: true, addition: additionRecord };
  }
  catch (error) {
    console.error('Error inserting data:', error);
    return {
      error: 'An error occurred while inserting data.',
    };
  }
})