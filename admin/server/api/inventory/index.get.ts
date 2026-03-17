import { defineEventHandler, getQuery } from 'h3';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OTHER_ITEMS = 'Other Items';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const categoryFilter = query.category !== undefined && query.category !== '' ? String(query.category).trim() : undefined;

  if (categoryFilter === OTHER_ITEMS) {
    const items = await prisma.inventory.findMany({
      where: { category: { in: [OTHER_ITEMS, 'Other items'] } },
      orderBy: [{ size: 'asc' }, { gender: 'asc' }],
    });
    const subcategoryMap = new Map<string, { size: string; quantity: number }[]>();
    let totalQty = 0;
    for (const item of items) {
      totalQty += item.quantity;
      const sub = (item.size ?? 'Other').trim() || 'Other';
      if (!subcategoryMap.has(sub)) subcategoryMap.set(sub, []);
      const list = subcategoryMap.get(sub)!;
      const itemName = (item.gender ?? '').trim();
      const existing = list.find((entry) => entry.size === itemName);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        list.push({
          size: itemName,
          quantity: item.quantity,
        });
      }
    }
    const genders = Array.from(subcategoryMap.entries()).map(([name, info]) => ({ name, info }));
    return [{ category: OTHER_ITEMS, quantity: totalQty, genders }];
  }

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

  for (const cat of catList) {
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