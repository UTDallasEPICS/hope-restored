import { defineEventHandler } from 'h3';
import prisma from '../../../lib/prisma';

export default defineEventHandler(async () => {
  const users = await prisma.user.findMany();
  return users;
});