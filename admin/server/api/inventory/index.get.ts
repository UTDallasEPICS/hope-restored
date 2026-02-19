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
      //{category:"asc"},
      {gender:"asc"},
      //{size:"asc"},
    ],
  })
  let groupedData:{category:string,quantity:number,genders:{name:string,info:{size:string,quantity:number}[]}[]}[] = []

  for(const cat of catList){
    groupedData.push({
      category:cat.category,
      quantity:0,
      genders:[{
          name:"Unisex",
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
      for(const gender of row.genders){
        if(item.gender === gender.name){
          if(item.category !== 'Shoes' || item.quantity > 0)
          gender.info.push({
            size:item.size? item.size : "",
            quantity:item.quantity
          })
        }
      }
    }
  }
}
  return groupedData
});