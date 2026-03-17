import { defineEventHandler, getQuery } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const catList = await prisma.inventory.groupBy({
    by:['category'],
    where:{
      category: query.category !== undefined? String(query.category) : undefined,
    }
  })
  const inv = await prisma.inventory.findMany({
    where:{
      category: query.category !== undefined? String(query.category) : undefined,
      quantity: {
         gt: query.category === "Shoes"? 0 : -1
      }
    },
    orderBy:[
      {gender:"asc"},
    ],
  })
  let groupedData:{category:string,quantity:number,additions:number,removals:number,genders:{name:string,info:{size:string,quantity:number,additions:number,removals:number}[]}[]}[] = []

  for(const cat of catList){
    groupedData.push({
      category:cat.category,
      quantity:0,
      additions:0,
      removals:0,
      genders:[{
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
      ]
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
  return groupedData
});