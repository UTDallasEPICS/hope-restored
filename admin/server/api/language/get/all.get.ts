import { PrismaClient } from "@prisma/client";
import { defineEventHandler, createError, setResponseHeader } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    setResponseHeader(event, "Access-Control-Allow-Origin", "*")
    try {
        const languages = await prisma.language.findMany();
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
