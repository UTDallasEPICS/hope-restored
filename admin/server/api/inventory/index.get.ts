import { defineEventHandler, getQuery } from 'h3';
import { PrismaClient } from '@prisma/client';
import { group } from 'node:console';

const prisma = new PrismaClient();

const OTHER_ITEMS = 'Other Items';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const categoryFilter = query.category !== undefined && query.category !== '' ? String(query.category).trim() : undefined;
  const catList = await prisma.inventory.groupBy({
    by: ['category'],
    where: {
      category: categoryFilter ?? undefined,
    },
  });
  const inv = await prisma.inventory.findMany({
    where: {
      category: categoryFilter ?? undefined,
      quantity: {
        gt: categoryFilter === 'Shoes' ? 0 : -1,
      },
    },
    orderBy:[
      {gender:"asc"},
    ],
  })
  let groupedData:{category:string,quantity:number,additions:number,removals:number,genders:{name:string,info:{size:string,quantity:number,additions:number,removals:number}[]}[]}[] = []
  let orderedData:{category:string,quantity:number,additions:number,removals:number,genders:{name:string,info:{size:string,quantity:number,additions:number,removals:number}[]}[]}[] = []
  for (const cat of catList) {
    groupedData.push({
      category:cat.category,
      quantity:0,
      additions:0,
      removals:0,
      genders:cat.category !== "Other Items"? [{
          name:"Child",
          info:[]
        },
        {
          name:"Male",
          info:[]
        },
        {
          name:"Female",
          info:[]
        },
      ] :[
        {name:'Appliances',info:[]},
        {name: 'Infant care',info:[] },
        {name:'Hardware',info:[] },
        {name:'Electronics',info:[] },
        {name:'Furniture',info:[]}, 
        {name:'Bedding',info:[] },
        {name:'Kitchen',info:[] },
        {name:'Toys', info:[]},
        {name:'School supplies',info:[] },
        {name:'Personal care',info:[] },
        {name:'Cleaning supplies',info:[] },
       { name:'Other',info:[]}]
      })
  }

  
for(const item of inv){
  for(const row of groupedData){
    if(item.category === row.category){
      row.quantity += item.quantity
      row.additions+= item.additions
      row.removals+= item.removals
      for(const gender of row.genders){
        if(item.gender === gender.name){
          gender.info.push({
            size:item.size? item.size : "",
            quantity:item.quantity,
            additions:item.additions,
            removals:item.removals
          })
        }
      }
    }
  }
}
const simpleCategories =['Blankets','Hygiene Packs','Snack Packs'];
const letterSizedCategories=['Shirts','Pants','Jackets','Underwear'];
const numberSizedCategories=['Shoes'] //add pants
let simpleData:{category:string,quantity:number,additions:number,removals:number,genders:{name:string,info:{size:string,quantity:number,additions:number,removals:number}[]}[]}[] = []
let letterData:{category:string,quantity:number,additions:number,removals:number,genders:{name:string,info:{size:string,quantity:number,additions:number,removals:number}[]}[]}[] = []
let numberData:{category:string,quantity:number,additions:number,removals:number,genders:{name:string,info:{size:string,quantity:number,additions:number,removals:number}[]}[]}[] = []
let otherData:{category:string,quantity:number,additions:number,removals:number,genders:{name:string,info:{size:string,quantity:number,additions:number,removals:number}[]}[]}[] = []
for(const cat of groupedData){
  if(simpleCategories.includes(cat.category)){
    simpleData.push(cat);
  }
  else if(letterSizedCategories.includes(cat.category)){
    letterData.push(cat);
  }
  else if(numberSizedCategories.includes(cat.category)){
    numberData.push(cat);
  }
  else{
    otherData.push(cat);
  }
}
orderedData.push(...simpleData);
orderedData.push(...letterData);
orderedData.push(...numberData);
orderedData.push(...otherData);
  return orderedData
});