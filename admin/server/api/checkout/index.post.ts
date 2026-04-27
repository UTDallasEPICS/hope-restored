import { defineEventHandler, readBody } from 'h3';
import prisma from '~/lib/prisma';
import { requireSession } from '~/server/utils/auth';

type CheckoutRemoval = {
  category: string;
  size?: string;
  quantity: number;
  gender?: string;
};

export default defineEventHandler(async (event) => {
  const session = await requireSession(event, 'staff');
  const userEmail = session.user.email ?? '';
  const userName = session.user.name ?? session.user.email ?? 'Unknown User';

  const body = await readBody(event);
  const removals: CheckoutRemoval[] = body?.removals || [];
  try {
    for(const removal of removals){
      if(removal.category !== "Other Items"){
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
      }else{

        const inv = await prisma.inventory.findFirst({
          where:{size:String(removal.gender)},
        })
        await prisma.inventory.update({
          where:{code:inv?.code},
          data:{
            quantity:{
              decrement:removal.quantity
            },
            removals:{
              increment:removal.quantity
            }
          }
        })
      }

      await (prisma as any).activityLog.create({
        data: {
          email: userEmail,
          name: userName,
          category: removal.category,
          gender: removal.gender,
          size: removal.size,
          action: 'Removal',
          amount: removal.quantity,
        },
      });
    }
    return { success: true };
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
