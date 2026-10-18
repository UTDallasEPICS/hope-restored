import { defineEventHandler, readBody } from 'h3';
import prisma from '../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
    }
  });
  return user;
});