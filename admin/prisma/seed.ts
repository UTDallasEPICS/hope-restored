// Clears any existing data/records in the InventoryRecords table and adds records where the quantity for each of the seven categories of 
// items is 0 and the date is set to the current date at midnight CST 

// To run this seed file, run npx prisma db seed from project root

// admin/prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("Starting to seed InventoryRecords...");

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
  await prisma.inventory.deleteMany();
  console.log("Cleared old records and reset ID sequence.");

  await prisma.inventory.createMany({
    data:inventoryCategories
  })

}

seed()
  .catch((error) => {
    console.error("Error seeding data:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

