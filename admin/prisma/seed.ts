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

  const clothes_categories = ["Shirts", "Pants", "Jackets","Underwear"];
  const sizes = ["XS", "S", "M", "L", "XL"];
  const genders = ["Unisex", "Male", "Female"];
  const simple_categories = ["Snack Packs", "Hygiene Packs", "Blankets"];
  const shoeSizeOptions = (() => {
  const sizes: string[] = [];
  for (let n = 5; n <= 14.5; n += 0.5) sizes.push(String(n));
    return sizes;
  })();
  const inventoryCategories = (()=>{
    const entries: {code:string,category:string,size?:string,gender?:string}[] = [];
    for(const cat of clothes_categories){
      for(const gender of genders){
        for(const size of sizes){
          entries.push({
            code:cat+size+gender,
            category:cat,
            size:size,
            gender:gender
          })
        }
      }
    }
    for(const simple_cat of simple_categories){
      entries.push({
        code:simple_cat,
        category:simple_cat
      })
    }
    for(const gender of genders){
      for(const shoeSize of shoeSizeOptions){
        entries.push({
          code:"Shoes"+shoeSize+gender,
          category:"Shoes",
          size:shoeSize,
          gender:gender
        })
      }
    }
    return entries;
  })();


  // Clear old records
  await prisma.inventoryRecords.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name='InventoryRecords';`);
  console.log("Cleared old records and reset ID sequence.");

  // Insert all records
  await prisma.inventoryRecords.createMany({
    data: inventoryRecords,
  });

  await prisma.inventory.createMany({
    data:inventoryCategories
  })

  console.log("InventoryRecords table seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("Error seeding data:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

