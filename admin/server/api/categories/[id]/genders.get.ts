import { createError, defineEventHandler, getRouterParam } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  if (!rawId || !/^[1-9]\d*$/.test(rawId)) {
    throw createError({ statusCode: 400, message: "Category ID must be a positive integer." });
  }
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id > 2147483647) {
    throw createError({ statusCode: 400, message: "Category ID must be a positive integer within the supported range." });
  }

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      categoryGenders: {
        select: { gender: { select: { id: true, gender_name: true } } },
        orderBy: { gender: { gender_name: "asc" } },
      },
    },
  });
  if (!category) {
    throw createError({ statusCode: 404, message: "Category not found." });
  }
  return category.categoryGenders.map(({ gender }) => gender);
});
