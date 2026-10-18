import { defineEventHandler, getRouterParam } from 'h3';
import prisma from '../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const email = getRouterParam(event, 'email');
  const user = await prisma.user.findUnique({
    where: { email: email }
  });
  return Boolean(user);
});