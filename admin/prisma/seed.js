"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// admin/prisma/seed.ts
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var today, inventoryRecords;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Starting to seed InventoryRecords...");
                    today = new Date();
                    today.setHours(0, 0, 0, 0); // sets time to 00:00:00
                    inventoryRecords = [
                        { date: today, category: "Shirts", quantity: 0 },
                        { date: today, category: "Jackets", quantity: 0 },
                        { date: today, category: "Pants", quantity: 0 },
                        { date: today, category: "Underwear", quantity: 0 },
                        { date: today, category: "Shoes", quantity: 0 },
                        { date: today, category: "Snack Packs", quantity: 0 },
                        { date: today, category: "Hygiene Packs", quantity: 0 },
                    ];
                    // Optional: clear old records before inserting
                    return [4 /*yield*/, prisma.inventoryRecords.deleteMany()];
                case 1:
                    // Optional: clear old records before inserting
                    _a.sent();
                    console.log("Cleared old records.");
                    // Insert all records
                    return [4 /*yield*/, prisma.inventoryRecords.createMany({
                            data: inventoryRecords,
                        })];
                case 2:
                    // Insert all records
                    _a.sent();
                    console.log("InventoryRecords table seeded successfully!");
                    return [2 /*return*/];
            }
        });
    });
}
seed()
    .catch(function (error) {
    console.error("Error seeding data:", error);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/*
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
 // const uniqueNamesSet = new Set<string>();
 // const uniquePhoneNumbersSet = new Set<string>();

  return new Promise((resolve, reject) => {
    fs.readdirSync(RESOURCES_PATH).forEach((fileName: string) => {

    fs.createReadStream(RESOURCES_PATH + "/" + fileName)
      .pipe(csv())
      .on("data", (data: any) => {
        const name = data["Name"];
        //const phoneNumbers = data["Phone"] ? data["Phone"].split(",") : [];


        let phoneNumbers;

        if(data["Phone"] != "")
          {
            const phoneNumberList = data["Phone"].split(",");
            
            phoneNumbers = phoneNumberList.map((number: string) => {
              
              
              let phoneNumberName = "";
            let onlyPhoneNumber = number.trim();

            if(number.includes("["))
            {
              let index1 = number.indexOf("[");
              let index2 = number.indexOf("]");

              //get location name
              phoneNumberName = number.substring(index1, index2 + 1).trim();

              onlyPhoneNumber = number.slice(0, index1) + number.slice(index2 + 1);;
            }

              //const filteredPhoneNumber = onlyPhoneNumber.split(",");

              return  {
                name: phoneNumberName.trim() || undefined,
                number: onlyPhoneNumber?.trim() || "",
              };
              

            });

        }

        // Check if the name and phone numbers are unique
        // Temporary fix. Need to remove duplicate name in file
        // For phone, need to make many-to-many relationship in Prisma
 //       const isNameUnique = !uniqueNamesSet.has(name);
 //       const arePhoneNumbersUnique = phoneNumbers.every(
 //         (phone: any) => !uniquePhoneNumbersSet.has(phone)
 //       );

 //       if (isNameUnique && arePhoneNumbersUnique) {

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
                  locationName: locationName.trim() || "",
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
            phoneNumbers: phoneNumbers ?? [],
            emails: data["Emails"] ? data["Emails"].split(",") : undefined,
            groupName: data["Type"] ? data["Type"] : "Others",
            locations: location ?? [],
          };

      //    uniqueNamesSet.add(name);
      //    phoneNumbers.forEach((phone: any) =>
      //      uniquePhoneNumbersSet.add(phone)
      //    );
          resources.push(resource);
 //       }

        // break
      })
      .on("end", () => {
        resolve(resources);
      })
      .on("error", (error: Error) => {
        reject(error);
      });

    });

  });
*/
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



}
*/
/*
seed()
  .catch((error) => {
    console.error("Error seeding resources:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
*/
/*
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

*/
