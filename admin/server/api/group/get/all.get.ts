import { PrismaClient } from "@prisma/client";
import { defineEventHandler, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const groups = await prisma.group.findMany();
   

    return groups;
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      message: "Error fetching groups",
      data: error,
    });
  }
});
