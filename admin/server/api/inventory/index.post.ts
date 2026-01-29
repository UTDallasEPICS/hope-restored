import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the function that handles the request
//async function main(event) {
export default defineEventHandler(async (event) => {
  // Read the request body (entry data)
  const entry = await readBody(event);

  try {
    // Insert a new category, ONLY if it does not exist already
    const category = await prisma.itemCategory.upsert({
      where: { name: entry.category },
      update: {},
      create: { name: entry.category },
    });
  
    // Insert a new style, ONLY if it does not exist already
    const style = await prisma.itemStyle.upsert({
      where: { name: entry.style },
      update: {},
      create: { name: entry.style },
    });
  
    // Insert a new size, ONLY if it does not exist already
    const size = await prisma.size.upsert({
      where: { sizeCode: entry.size },
      update: {},
      create: { sizeCode: entry.size },
    });
  
    // Insert gender, ONLY if it does not exist already
    const gender = await prisma.gender.upsert({
      where: { name: entry.gender },
      update: {},
      create: { name: entry.gender },
    });
  

      // NOTE: InventoryRecords is the source of truth for available stock.
      // We no longer upsert the Inventory table on quick adds here; instead
      // we create an InventoryRecords entry (and an Additions history row).
      // Record the addition in the Additions table (keeps a history of added quantity)
      // Record the addition in the Additions table (keeps a history of added quantity)
      let additionRecord = null;
      try {
        // Normalize to start of day (local timezone) for consistent date filtering
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        
        additionRecord = await prisma.additions.create({
          data: {
            category: entry.category,
            dateAdded: startOfDay,
            quantity: entry.quantity,
          },
          select: {
            category: true,
            quantity: true,
            dateAdded: true,
          }
        });

        // Also create or update an InventoryRecords entry to represent available stock (used/consumed by checkout)
        try {
          const qty = Number(entry.quantity) || 0;
          if (qty > 0) {
            const now = new Date();
            // use day-range (start <= date < nextDay) to find today's row for the category
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const nextDay = new Date(startOfDay);
            nextDay.setDate(startOfDay.getDate() + 1);

            const existing = await prisma.inventoryRecords.findFirst({
              where: {
                category: entry.category,
                date: { gte: startOfDay, lt: nextDay },
              },
            });

            if (existing) {
              await prisma.inventoryRecords.update({
                where: { id: existing.id },
                data: { quantity: { increment: qty } },
              });
            } else {
              await prisma.inventoryRecords.create({
                data: {
                  date: now,
                  category: entry.category,
                  quantity: qty,
                },
              });
            }
          }
        } catch (recErr) {
          console.error('Error recording inventory record:', recErr);
        }
      } catch (addErr) {
        // If logging the addition fails, don't block the main operation but log the issue
        console.error('Error recording addition:', addErr);
      }

      console.log('Data inserted successfully!');
      return { success: true, addition: additionRecord };
  }
  catch (error) {
    // If there's an error, log it and return an error message
    console.error('Error inserting data:', error);
    return {
      error: 'An error occurred while inserting data.',
    };
  }
})

// Export the event handler using defineEventHandler
//export default defineEventHandler(main);