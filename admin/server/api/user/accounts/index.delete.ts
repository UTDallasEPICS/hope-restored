import { defineEventHandler, readBody } from 'h3';
import prisma from '../../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  await prisma.user.delete({
    where: { email: body.email }
  });
  return { success: true };
});