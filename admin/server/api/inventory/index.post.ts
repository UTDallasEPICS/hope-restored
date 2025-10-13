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

      // Insert a new entry in the inventory table, if it doesn't already exist. Otherwise, increment the quantity field
      await prisma.inventory.upsert({
        where: {
          barcode: barcode,
        },
        update: {
          quantity: {
            increment: entry.quantity,
          }
        },
        create: {
          barcode: barcode, // change to QRCode!!!
          quantity: entry.quantity,
          categoryId: category.id, // 2 digits in barcode
          styleId: style.id,       // 2 digits in barcode
          sizeId: size.id,         // 2 digits in barcode
          genderId: gender.id,     // 2 digits in barcode
        },
      });
      console.log('Data inserted successfully!');
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