import { defineEventHandler, readBody } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the function that handles the request
//async function main(event) {
export default defineEventHandler(async (event) => {
  // Read the request body (entry data)
  const entry = await readBody(event);

  function generateQRCode(){
    let categoryCode = "00";
    let styleCode = "00";
    let sizeCode = "00";
    let genderCode = "00"

    switch (entry.category){
      case "Blouses":
        categoryCode = "00";
        break;
      case "Shirts":
        categoryCode = "01";
        break;
      case "Pants":
        // map client 'Pants' to pants/dress pants code
        categoryCode = "04";
        break;
      case "Tops":
        categoryCode = "02";
        break;
      case "Dresses":
        categoryCode = "03";
        break;
      case "Dress Pants / Slacks":
        categoryCode = "04";
        break;
      case "Suits":
        categoryCode = "05";
        break;
      case "Jeans":
        categoryCode = "06";
        break;
      case "Shorts":
        categoryCode = "07";
        break;
      case "Socks":
        categoryCode = "08";
        break;
      case "Underwear":
        categoryCode = "09";
        break;
      case "Shoes / Boots":
        categoryCode = "10";
        break;
      case "Shoes":
        // client may send 'Shoes'
        categoryCode = "10";
        break;
      case "Sweater / Sweatshirt":
        categoryCode = "11";
        break;
      case "Coats / Jackets / Hoodies":
        categoryCode = "12";
        break;
      case "Jackets":
        // client may send 'Jackets'
        categoryCode = "12";
        break;
      case "Snack Packs":
        // non-clothing categories - assign unique codes
        categoryCode = "20";
        break;
      case "Hygiene Packs":
        categoryCode = "21";
        break;
    }

    switch (entry.style){
      case "Long Sleeve":
        styleCode = "00";
        break;
      case "Short Sleeve":
        styleCode = "01";
        break;
      case "T-Shirt":
        styleCode = "02";
        break;
      case "Casual":
        styleCode = "03";
        break;
      case "Fancy":
        styleCode = "04";
        break;
      case "Canvas":
        styleCode = "05";
        break;
      case "Leather":
        styleCode = "06";
        break;
      case "Misc.":
        styleCode = "07";
        break;
    }

    switch (entry.size){
      case "S":
        sizeCode = "00";
        break;
      case "M":
        sizeCode = "01";
        break;
      case "L":
        sizeCode = "02";
        break;
    }

    switch (entry.gender){
      case "Male":
        genderCode = "00";
        break;
      case "Female":
        genderCode = "01";
        break;
      case "Unisex":
        genderCode = "02";
        break;
    }

    const itemCode = categoryCode + styleCode + sizeCode + genderCode;
    return itemCode;

  }

  try {
    // Insert a new category, ONLY if it does not exist already
    const category = await prisma.itemCategory.upsert({
      where: { name: entry.category },
      update: {},
      create: { name: entry.category },
    });
  
    // Insert a new style, ONLY if it does not exist already
    const style = await prisma.itemStyle.upsert({
      where: { name: entry.style },
      update: {},
      create: { name: entry.style },
    });
  
    // Insert a new size, ONLY if it does not exist already
    const size = await prisma.size.upsert({
      where: { sizeCode: entry.size },
      update: {},
      create: { sizeCode: entry.size },
    });
  
    // Insert gender, ONLY if it does not exist already
    const gender = await prisma.gender.upsert({
      where: { name: entry.gender },
      update: {},
      create: { name: entry.gender },
    });
    
    const barcode = generateQRCode(); // generate qr code (barcode)

      // NOTE: InventoryRecords is the source of truth for available stock.
      // We no longer upsert the Inventory table on quick adds here; instead
      // we create an InventoryRecords entry (and an Additions history row).
      // Record the addition in the Additions table (keeps a history of added quantity)
      // Record the addition in the Additions table (keeps a history of added quantity)
      let additionRecord = null;
      try {
        // Normalize to start of day (local timezone) for consistent date filtering
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        
        additionRecord = await prisma.additions.create({
          data: {
            category: entry.category,
            dateAdded: startOfDay,
            quantity: entry.quantity,
          },
          select: {
            category: true,
            quantity: true,
            dateAdded: true,
          }
        });

        // Also create or update an InventoryRecords entry to represent available stock (used/consumed by checkout)
        try {
          const qty = Number(entry.quantity) || 0;
          if (qty > 0) {
            const now = new Date();
            // use day-range (start <= date < nextDay) to find today's row for the category
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const nextDay = new Date(startOfDay);
            nextDay.setDate(startOfDay.getDate() + 1);

            const existing = await prisma.inventoryRecords.findFirst({
              where: {
                category: entry.category,
                date: { gte: startOfDay, lt: nextDay },
              },
            });

            if (existing) {
              await prisma.inventoryRecords.update({
                where: { id: existing.id },
                data: { quantity: { increment: qty } },
              });
            } else {
              await prisma.inventoryRecords.create({
                data: {
                  date: now,
                  category: entry.category,
                  quantity: qty,
                },
              });
            }
          }
        } catch (recErr) {
          console.error('Error recording inventory record:', recErr);
        }
      } catch (addErr) {
        // If logging the addition fails, don't block the main operation but log the issue
        console.error('Error recording addition:', addErr);
      }

      console.log('Data inserted successfully!');
      return { success: true, addition: additionRecord };
  }
  catch (error) {
    // If there's an error, log it and return an error message
    console.error('Error inserting data:', error);
    return {
      error: 'An error occurred while inserting data.',
    };
  }
})

// Export the event handler using defineEventHandler
//export default defineEventHandler(main);