// Clears any data/records from the Additions table

// To run this file, run npx tsx admin/prisma/clearAdditions.ts from project root

// admin/prisma/clearAdditions.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearAdditions() {
  console.log("Deleting all records from Additions table...");

  await prisma.additions.deleteMany();

  console.log("All records deleted from Additions table successfully!");
}

clearAdditions()
  .catch((error) => {
    console.error("Error deleting Additions records:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });