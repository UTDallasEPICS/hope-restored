import { defineEventHandler, getQuery } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the function that handles the request
export default defineEventHandler(async (event) => {
  // Read the request body (entry data)
  const query = getQuery(event);
  const User = await prisma.user.findUnique({
    where:{
        email:query.email
    }
  });
  return Boolean(User);
});