import { createError, defineEventHandler, readBody, setResponseStatus } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body: unknown = await readBody(event);
  if (!body || typeof body !== "object" || !("catName" in body) ||
      !("sizeType" in body) || !("genderIds" in body) ||
      typeof body.catName !== "string" || typeof body.sizeType !== "string" ||
      !Array.isArray(body.genderIds)) {
    throw createError({ statusCode: 400, message: "Category name, size type, and gender IDs are required." });
  }

  const catName = body.catName.trim();
  const sizeType = body.sizeType.trim();
  const genderIds: unknown[] = body.genderIds;
  if (!catName || !sizeType || genderIds.length === 0 ||
      !genderIds.every((id): id is number => typeof id === "number" && Number.isInteger(id) && id > 0 && id <= 2147483647) ||
      new Set(genderIds).size !== genderIds.length) {
    throw createError({
      statusCode: 400,
      message: "Provide a non-empty category name and size type, and distinct positive integer gender IDs.",
    });
  }

  try {
    const category = await prisma.category.create({
      data: {
        catName,
        sizeType,
        categoryGenders: {
          create: genderIds.map((id) => ({ gender: { connect: { id } } })),
        },
      },
      select: {
        id: true,
        catName: true,
        sizeType: true,
        categoryGenders: {
          select: { gender: { select: { id: true, gender_name: true } } },
          orderBy: { gender: { gender_name: "asc" } },
        },
      },
    });
    setResponseStatus(event, 201);
    return {
      id: category.id,
      catName: category.catName,
      sizeType: category.sizeType,
      genders: category.categoryGenders.map(({ gender }) => gender),
    };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error) {
      if (error.code === "P2002") {
        throw createError({ statusCode: 409, message: "A category with this name already exists." });
      }
      if (error.code === "P2025") {
        throw createError({ statusCode: 400, message: "One or more gender IDs do not exist." });
      }
    }
    throw error;
  }
});
