import { defineEventHandler } from 'h3';
import prisma from '../../../../lib/prisma';
import { requireSession } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireSession(event, 'admin');
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
});
