import { defineEventHandler, getQuery } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the function that handles the request
export default defineEventHandler(async (event) => {
  // Read the request body (entry data)
  const query = getQuery(event);
    console.log("Query:",query.email);
  const User = await prisma.user.findUnique({
    where:{
        email:query.email
    }
  });
  if(User){
    console.log(User);
    return true;
  }
  else{
    console.log("Not found");
    return false;
  }
});