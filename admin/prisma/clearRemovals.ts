// Clears any data/records from the Removals table

// To run this file, run npx tsx admin/prisma/clearRemovals.ts from project root

// admin/prisma/clearRemovals.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearRemovals() {
  console.log("Deleting all records from Removals table...");

  await prisma.removals.deleteMany();

  // Reset the auto-increment sequence for Removals
  await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name='Removals';`);

  console.log("All records deleted and ID reset for Removals table successfully!");
}

clearRemovals()
  .catch((error) => {
    console.error("Error deleting Removals records:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });