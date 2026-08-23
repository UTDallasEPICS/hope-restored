import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../../../../admin/generated/prisma/client";
import { defineEventHandler, createError } from "h3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" }),
});

export default defineEventHandler(async (event) => {
  try {
    const groups = await prisma.group.findMany();
    if (!groups || groups.length === 0) {
      throw createError({
        statusCode: 404,
        message: "Groups not found",
      });
    }

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
