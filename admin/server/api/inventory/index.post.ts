import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default defineEventHandler(async (event) => {
  const session = await requireSession(event, 'staff');
  const userEmail = session.user.email ?? '';
  const userName = session.user.name ?? session.user.email ?? 'Unknown User';
  const entry = await readBody(event);
  
  try {
    const invCode = entry.category + entry.size + entry.gender
    let additionRecord = null;
      // Create or update an Inventory entry to represent available stock of each category
      try {
        const inv = await prisma.inventory.upsert({
        where:{code:invCode},
        create:{
          code: invCode,
          category: entry.category,
          gender: entry.gender,
          size: entry.size,
          quantity: entry.quantity,
          additions: entry.quantity
        },
        update:{
          quantity:{
            increment:entry.quantity
          },
          additions:{
            increment:entry.quantity
          }
        }
      })

      await (prisma as any).activityLog.create({
        data: {
          email: userEmail,
          name: userName,
          category: entry.category,
          gender: entry.gender,
          size: entry.size,
          action: 'Addition',
          amount: entry.quantity,
        },
      });
    } catch (recErr) {
      console.error('Error recording inventory record:', recErr);
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