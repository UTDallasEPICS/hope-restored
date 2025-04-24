// server/usage/Resource/seed.ts
import { PrismaClient } from "@prisma/client";
import {
  type CreateResourceInput,
  CreateResourceUseCase,
} from "~/server/usage/Resource/create";

const prisma = new PrismaClient();

async function seed() {
  const usage = new CreateResourceUseCase();

  let resources = await read_Resources();
  for (const resource of resources) {
    console.log("Seeding resource:", resource.name, resource.phoneNumbers);
    await usage.execute(resource);
  }

  const category = await prisma.itemCategory.findFirst();
  const style = await prisma.itemStyle.findFirst();
  const size = await prisma.size.findFirst();
  const gender = await prisma.gender.findFirst();

  if (!category || !style || !size || !gender) {
    console.log('One or more required entities are missing');
    return; // Exit if any required data is missing
  }
  // Insert an inventory item with the barcode `01010101`
  await prisma.inventory.create({
    data: {
      barcode: '02030503',
      quantity: 10,
      categoryId: category.id, // 1 (01 in barcode)
      styleId: style.id,       // 1 (01 in barcode)
      sizeId: size.id,         // 1 (01 in barcode)
      genderId: gender.id,     // 1 (01 in barcode)
    },
  });
  console.log('First batch of data inserted successfully!');

  console.log("Seeding completed!");
}

const RESOURCES_PATH = "static/client_files/Resources";
//const COLLIN_COLLEGE_PATH = "static/client_files/collin-college/collin_college.csv";

function read_Resources(): Promise<CreateResourceInput[]> {
  const fs = require("fs");
  const csv = require("csv-parser");
  const resources: CreateResourceInput[] = [];
  const uniqueNamesSet = new Set<string>();
  const uniquePhoneNumbersSet = new Set<string>();

  return new Promise((resolve, reject) => {
    fs.readdirSync(RESOURCES_PATH).forEach((fileName: string) => {

    fs.createReadStream(RESOURCES_PATH + "/" + fileName)
      .pipe(csv())
      .on("data", (data: any) => {
        const name = data["Name"];
        const phoneNumbers = data["Phone"] ? data["Phone"].split(",") : [];

        // Check if the name and phone numbers are unique
        // Temporary fix. Need to remove duplicate name in file
        // For phone, need to make many-to-many relationship in Prisma
        const isNameUnique = !uniqueNamesSet.has(name);
        const arePhoneNumbersUnique = phoneNumbers.every(
          (phone: any) => !uniquePhoneNumbersSet.has(phone)
        );

        if (isNameUnique && arePhoneNumbersUnique) {
         /* 
          const fullAddress = data["Addresses"];

          let location;

          if(fullAddress != "")
          {
            const addresses = fullAddress.split("::");
            
            location = addresses.map((address: string) => {
              
              let locationName = "";
              let modifiedAddress = address.trim();

              if(address.includes("["))
              {
                let index1 = address.indexOf("[");
                let index2 = address.indexOf("]");

                //get location name
                locationName = address.substring(index1, index2 + 1).trim();

                modifiedAddress = address.substring(index2 + 1).trim();
              }  

              const addressParts = modifiedAddress.split(",");

              return  {
                name: locationName.trim() || "",
                city: addressParts[0]?.trim() || "",
                state: addressParts[1]?.trim() || "",
                postalCode: addressParts[2]?.trim() || "",
                addressLine1: addressParts[3]?.trim() || "",
                addressLine2: addressParts[4]?.trim() || "",
              };
              

            });
          */



            const fullAddress = data["Addresses"];

            let location;
  
            if(fullAddress != "")
            {
              const addresses = fullAddress.split("::");
              
              location = addresses.map((address: string) => {
                
  
                const addressParts = address.split(",");
  
                return  {
                  city: addressParts[0]?.trim() || "",
                  state: addressParts[1]?.trim() || "",
                  postalCode: addressParts[2]?.trim() || "",
                  addressLine1: addressParts[3]?.trim() || "",
                  addressLine2: addressParts[4]?.trim() || "",
                };
                
  
              });

          }
          
          
          const resource = {
            name: name,
            description: data["Description"],
            externalLink: data["Links"] ? data["Links"] : undefined,
            languages: ["English"],
            phoneNumbers: phoneNumbers,
            emails: data["Emails"] ? data["Emails"].split(",") : undefined,
            groupName: data["Type"] ? data["Type"] : "Others",
            locations: location ?? [],
          };

          uniqueNamesSet.add(name);
          phoneNumbers.forEach((phone: any) =>
            uniquePhoneNumbersSet.add(phone)
          );
          resources.push(resource);
        }
      })
      .on("end", () => {
        resolve(resources);
      })
      .on("error", (error: Error) => {
        reject(error);
      });

    });

  });

   /*
    const categories = [
      'Blouses',
      'Shirts',
      'Tops',
      'Dresses',
      'Dress Pants / Slacks',
      'Suits',
      'Jeans',
      'Shorts',
      'Socks',
      'Underwear',
      'Shoes / Boots',
      'Sweater / Sweatshirt',
      'Coats / Jackets / Hoodies'
    ];
    // Insert the first category
    for (const name of categories) {
      const category = await prisma.itemCategory.create({
        data: { name: name },
      });
      console.log(`Created category: ${category.name}`);
    }
  */
    // Insert the first style
    /*
    const styles = [
      'Long Sleeve',
      'Short Sleeve',
      'T-Shirt',
      'Casual',
      'Fancy',
      'Canvas',
      'Leather',
      'Misc.'
    ];
  
    // Create each style in the database under the fetched category
    for (const name of styles) {
      const style = await prisma.itemStyle.create({
        data: { name: name },
      });
      console.log(`Created style: ${style.name} with ID ${style.id}`);
    }
  */
  
    // Insert the first size
  /*
  const sizeCodes = [
      // Basic sizes
      "XS", "S", "M", "L", "XL", "2XL", "3XL", 
      "0", "2", "4", "6", "8", "10", "12", 
      "14", "16", "18", "20", "22", "24", "26",
      
      // Sizes with measurements
      "S, 14-14.5\"", "M, 15-15.5\"", "L, 16-16.5\"", 
      "XL, 17-17.5\"", "2XL, 18-18.5\"", "3XL, 19-19.5\"", "4XL, 20-20.5\" up",
      "S, 29-30\"", "M, 31-33\"", "L, 34-35\"", 
      "XL, 36-38\"", "2XL, 40-42", "3XL, 44-48", "4XL, 50\" up",
      
      // Infant and toddler sizes
      "0-3 mos", "3-6 mos", "6-12 mos", "12-18 mos", 
      "18 mos", "2T - 4T", "5 - 8", "10 -12", "14 +",
  
      // Numeric sizes
      "3.0", "3.5", "4.0", "4.5", "5.0", "5.5", 
      "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", 
      "9.0", "9.5", "10.0", "10.5", "11.0", "11.5", 
      "12.0", "12.5", "13.0", "14 +"
    ];
    for (const code of sizeCodes){
      const size = await prisma.size.create({
        data: { sizeCode: code },
      });
      console.log(`size code: ${size.sizeCode}`);
    }
    */
   
    // Insert the first gender
    /*
    const genders = [
      'Men',
      'Woman',
      'Children'
    ];
    for (const name of genders) { 
      const gender = await prisma.gender.create({
        data: { name: name },
      });
      console.log(`Created gender: ${gender.name}`);
  
    }
  */


}

seed()
  .catch((error) => {
    console.error("Error seeding resources:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  

const RESOURCES: CreateResourceInput[] = [
  {
    name: "Food Bank Assistance",
    description: "Provides food to individuals and families in need.",
    eligibility: "Low-income families and individuals",
    cost: 0,
    externalLink: "https://foodbank.org",
    demographics: ["Families", "Elderly", "Children"],
    languages: ["English", "Spanish"],
    locations: [
      {
        addressLine1: "123 Main St",
        addressLine2: "Apt 101",
        city: "Dallas",
        state: "TX",
        postalCode: "75201",
      },
    ],
    phoneNumbers: ["(214) 555-1234"],
    emails: ["foodbank@sample.com"],
    groupName: "Community Services",
  },
  {
    name: "Homeless Shelter",
    description: "Shelter and support services for the homeless.",
    eligibility: "Homeless individuals",
    cost: 0,
    externalLink: "https://shelter.org",
    demographics: ["Homeless", "Veterans", "Youth"],
    languages: ["English"],
    locations: [
      {
        addressLine1: "456 Oak St",
        addressLine2: "Suite 200",
        city: "Dallas",
        state: "TX",
        postalCode: "75202",
      },
    ],
    phoneNumbers: ["(214) 555-5678"],
    groupName: "Emergency Services",
  },
  {
    name: "Healthcare Clinic",
    description: "Free healthcare services for uninsured individuals.",
    eligibility: "Uninsured individuals, families below poverty line",
    cost: 0,
    externalLink: "https://healthcareclinic.org",
    demographics: ["Low-income", "Uninsured"],
    languages: ["English", "Spanish", "Vietnamese"],
    locations: [
      {
        addressLine1: "789 Maple St",
        addressLine2: "Floor 2",
        city: "Dallas",
        state: "TX",
        postalCode: "75203",
      },
    ],
    phoneNumbers: ["(214) 555-6789"],
    emails: ["healthcare@sample.com"],
    groupName: "Health Services",
  },
  {
    name: "Job Training Program",
    description: "Job readiness and skill development for the unemployed.",
    eligibility: "Unemployed individuals",
    cost: 0,
    externalLink: "https://jobtraining.org",
    demographics: ["Unemployed", "Youth", "Adults"],
    languages: ["English"],
    locations: [
      {
        addressLine1: "101 Elm St",
        addressLine2: "Suite 101",
        city: "Dallas",
        state: "TX",
        postalCode: "75204",
      },
    ],
    phoneNumbers: ["(214) 555-9876"],
    groupName: "Workforce Development",
  },
  {
    name: "Mental Health Counseling",
    description: "Provides mental health support and counseling services.",
    eligibility: "Anyone in need of mental health support",
    cost: 0,
    externalLink: "https://mentalhealth.org",
    demographics: ["All ages", "Families"],
    languages: ["English", "Spanish"],
    locations: [
      {
        addressLine1: "202 Birch St",
        addressLine2: "Suite 300",
        city: "Dallas",
        state: "TX",
        postalCode: "75205",
      },
    ],
    phoneNumbers: ["(214) 555-2345"],
    groupName: "Health Services",
  },
  {
    name: "Free Legal Aid",
    description: "Provides legal assistance to low-income individuals.",
    eligibility: "Low-income individuals in need of legal help",
    cost: 0,
    externalLink: "https://legalaid.org",
    demographics: ["Low-income", "Seniors", "Immigrants"],
    languages: ["English", "Spanish", "Chinese"],
    locations: [
      {
        addressLine1: "303 Pine St",
        addressLine2: "Unit A",
        city: "Dallas",
        state: "TX",
        postalCode: "75206",
      },
    ],
    phoneNumbers: ["(214) 555-4321"],
    groupName: "Legal Assistance",
  },
  {
    name: "Child Care Support",
    description: "Childcare services for working parents.",
    eligibility: "Working parents in need of childcare support",
    cost: 100,
    externalLink: "https://childcare.org",
    demographics: ["Working parents", "Single parents"],
    languages: ["English", "Spanish"],
    locations: [
      {
        addressLine1: "404 Cedar St",
        addressLine2: "Floor 1",
        city: "Dallas",
        state: "TX",
        postalCode: "75207",
      },
    ],
    phoneNumbers: ["(214) 555-1122"],
    groupName: "Family Services",
  },
  {
    name: "Youth Sports League",
    description: "Organized sports for children to promote physical activity.",
    eligibility: "Children and teenagers",
    cost: 50,
    externalLink: "https://youthsports.org",
    demographics: ["Children", "Teens"],
    languages: ["English"],
    locations: [
      {
        addressLine1: "505 Birch St",
        addressLine2: "Gym 1",
        city: "Dallas",
        state: "TX",
        postalCode: "75208",
      },
    ],
    phoneNumbers: ["(214) 555-8765"],
    groupName: "Recreation Programs",
  },
  {
    name: "Elder Care Support",
    description: "Assistance and support services for elderly individuals.",
    eligibility: "Elderly individuals",
    cost: 0,
    externalLink: "https://eldercare.org",
    demographics: ["Elderly", "Seniors"],
    languages: ["English", "Spanish"],
    locations: [
      {
        addressLine1: "606 Willow St",
        addressLine2: "Suite 201",
        city: "Dallas",
        state: "TX",
        postalCode: "75209",
      },
    ],
    phoneNumbers: ["(214) 555-6543"],
    groupName: "Health Services",
  },
];
