import { defineEventHandler } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async () => {
  return prisma.category.findMany({
    select: { id: true, catName: true, sizeType: true },
    orderBy: { catName: "asc" },
  });
});
