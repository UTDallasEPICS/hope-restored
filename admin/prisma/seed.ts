// Clears any existing data/records in the InventoryRecords table and adds records where the quantity for each of the seven categories of 
// items is 0 and the date is set to the current date at midnight CST 

// To run this seed file, run npx prisma db seed from project root

// admin/prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

async function seed() {
  console.log("Starting to seed InventoryRecords...");

  // Get today's midnight in US Central Time (CST/CDT as appropriate)
  const todayCST = DateTime.now()
    .setZone("America/Chicago")
    .startOf("day");

  // Convert to a JavaScript Date (in UTC) for Prisma
  const today = todayCST.toJSDate();

  // Inventory records to insert
  const inventoryRecords = [
    { date: today, category: "Shirts", quantity: 0 },
    { date: today, category: "Jackets", quantity: 0 },
    { date: today, category: "Pants", quantity: 0 },
    { date: today, category: "Underwear", quantity: 0 },
    { date: today, category: "Shoes", quantity: 0 },
    { date: today, category: "Snack Packs", quantity: 0 },
    { date: today, category: "Hygiene Packs", quantity: 0 },
  ];

  // Clear old records
  await prisma.inventoryRecords.deleteMany();
  await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name='InventoryRecords';`);
  console.log("Cleared old records and reset ID sequence.");

  // Insert all records
  await prisma.inventoryRecords.createMany({
    data: inventoryRecords,
  });

  console.log("InventoryRecords table seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("Error seeding data:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

