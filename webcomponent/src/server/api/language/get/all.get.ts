import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../../../../admin/generated/prisma/client";
import { defineEventHandler, createError } from "h3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" }),
});

export default defineEventHandler(async (event) => {
  try {
    const languages = await prisma.language.findMany();
    if (!languages || languages.length === 0) {
      throw createError({
        statusCode: 404,
        message: "Languages not found",
      });
    }
    return languages;
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      message: "Error fetching languages",
      data: error,
    });
  }
});
