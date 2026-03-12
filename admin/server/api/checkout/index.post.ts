import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const removals = body?.removals || [];
  
  try {
    //check if enough in inventory - if not, check if unisex overflow has enough
    for(const removal of removals){
      const invCode = removal.category + removal.size + removal.gender
      //subtract items from inventory
      try{
        const inv = await prisma.inventory.update({
          where:{code:invCode},
          data:{
            quantity:{
              decrement:removal.quantity
            },
            removals:{
              increment:removal.quantity
            }
          }
        })
      }catch (recErr) {
        console.error('Error recording inventory record:', recErr);
      }
    }
  } catch (err: any) {
    console.error('Checkout error:', err);
    console.error('Error details:', {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
    });
    return { success: false, error: String(err?.message || err) };
  }
});
