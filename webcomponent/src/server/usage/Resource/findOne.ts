import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../../admin/generated/prisma/client";
import { type ResourceDB, RESOURCE_INCLUDE_ALL } from "~/server/db/constants";

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

export class FindOneResourceUseCase {
  async execute(id: number): Promise<ResourceDB | null> {
    return prisma.resource.findUnique({
      where: { id },
      include: RESOURCE_INCLUDE_ALL,
    });
  }
}
