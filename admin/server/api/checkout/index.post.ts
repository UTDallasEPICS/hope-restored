import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const removals = body?.removals || [];
  
  try {
    //check if enough in inventory - if not, check if unisex overflow has enough
    try{
      for(const removal of removals){
      const invCode = removal.category + removal.size + removal.gender
      let result = await prisma.inventory.findFirst({
        where:{code:invCode}
      })
        if(!result || result.quantity < removal.quantity){
          let uni = await prisma.inventory.findFirst({
            where:{code:removal.category + removal.size + 'Unisex'}
          })
          if(uni && result && uni.quantity + result.quantity < removal.quantities)
            throw new Error("insufficient inventory")
          else if(result && uni){
            const uniRemovals = removal.quantity - result.quantity;
            removal.quantity -= uniRemovals;
            const inv = await prisma.inventory.update({
            where:{code:removal.category + removal.size + 'Unisex'},
            data:{
              quantity:{
                decrement:uniRemovals
              },
              removals:{
                increment:uniRemovals
              }
            }
          })
          }
        }

      }
    }catch(err){
      console.error(err);
      return { success: false, error: 'Insufficient inventory for one or more categories'};
    }
    



    for(const removal of removals){
      const invCode = removal.category + removal.size + removal.gender
      //create removals entry
      let removalRecord = null
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
