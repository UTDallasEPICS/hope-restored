import { createError, defineEventHandler, getQuery } from 'h3';
import prisma from '../../../lib/prisma';
import { requireSession } from '~/server/utils/auth';

// Define the function that handles the request
export default defineEventHandler(async (event) => {
  await requireSession(event, 'admin');
  // Read the request body (entry data)
  const query = getQuery(event);
  if (typeof query.email !== 'string' || !query.email.trim()) {
    throw createError({ statusCode: 400, message: 'An email is required.' });
  }
  const User = await prisma.user.findUnique({
    where:{
        email:query.email.trim().toLowerCase()
    }
  });
  return Boolean(User);
});
