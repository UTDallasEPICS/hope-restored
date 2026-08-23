import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../../admin/generated/prisma/client";

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

export class ArchiveResourceUseCase {
  async execute(id: number): Promise<void> {
    await prisma.resource.update({
      where: { id },
      data: { archived: true },
    });
  }
}
