import { createError, defineEventHandler, getRouterParam } from 'h3';
import prisma from '../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const emailParam = getRouterParam(event, 'email', { decode: true });
  const email = typeof emailParam === 'string' ? emailParam.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Exactly one valid email address is required.' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return Boolean(user);
});
