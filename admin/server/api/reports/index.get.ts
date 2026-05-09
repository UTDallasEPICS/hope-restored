import { PrismaClient } from '@prisma/client';
import { it } from 'node:test';
import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) =>{
    const params = getQuery(event);
    //console.log("params: ", params);
    const {startDate, endDate} = params;
  try{
        let sd = [];
        let ed = [];
        const todayStart = new Date(); todayStart.setHours(0,0,0,0);
        const todayEnd = new Date(); todayEnd.setHours(23,59,59,0);
        if(startDate && endDate){
            sd[0] = new Date(String(startDate)); sd[0].setHours(0,0,0,0);
            sd[1] = new Date(String(startDate)); sd[1].setHours(23,59,59,99);
            ed[0] = new Date(String(endDate)); ed[0].setHours(0,0,0,0);
            ed[1] = new Date(String(endDate)); ed[1].setHours(23,59,59,0);
        }else{
            //default to today
            sd[0] = todayStart;
            ed[1] = todayEnd;
            sd[1] = ed[1]; ed[0] = sd[0];
        }
        const catList = await prisma.inventory.groupBy({
            by:['category'],
        })
         const lastDates = await prisma.inventoryRecords.findMany({
            where:{
                date:{
                    gte:ed[0] <= todayStart ? ed[0] : todayStart,
                    lte:ed[1] <= todayEnd ? ed[1] : todayEnd
                }
            },
            orderBy:{
                date:'asc'
            }
        });
        const aggregations = await prisma.inventoryRecords.groupBy({
            by:['code','category','gender','size'],
            where:{
                date:{ 
                    gte:sd[0],
                    lte:ed[1] <= todayEnd? ed[1] : todayEnd,
                }
            },
            _sum:{
                additions:true,
                removals:true
            },
        });
        let groupedData:{
            category:string,
            quantity:number,
            additions:number,
            removals:number,
            genders:{
                name:string,
                info:{
                    size:string,
                    quantity:number,
                    additions:number,
                    removals:number}[]
                }[]
            }[] = [];
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
        for(const item of lastDates){
            for(const row of groupedData){
                if(item.category === row.category){
                    for(const gender of row.genders){
                        if(item.gender === gender.name){
                                gender.info.push({
                                    size:item.size? item.size : "",
                                    quantity:0,
                                    additions: 0,
                                    removals:0
                                })
                        }
                    }
                }
            }
        }
        for(const item of aggregations){
            for(const row of groupedData){
                if(item.category === row.category){
                    row.additions+= item._sum.additions ? item._sum.additions : 0
                    row.removals+= item._sum.removals? item._sum.removals : 0
                    for(const gender of row.genders){
                        if(item.gender === gender.name){
                            for(const i of gender.info){
                                if(item.size == i.size){
                                    i.additions+=item._sum.additions? item._sum.additions : 0,
                                    i.removals+=item._sum.removals? item._sum.removals : 0
                                }
                            }
                        }
                    }
                }
            }
        }
              
        for(const item of lastDates){
            for(const row of groupedData){
                if(item.category === row.category){
                    row.quantity += item.quantity
                    for(const gender of row.genders){
                        if(item.gender === gender.name){
                            for(const i of gender.info){
                                if(item.size == i.size){
                                    i.quantity += item.quantity
                                }
                            }
                        }
                    }
                }
            }
        }
        let orderedData:{category:string,quantity:number,additions:number,removals:number,genders:{name:string,info:{size:string,quantity:number,additions:number,removals:number}[]}[]}[] = []
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
    }catch(error){
        console.log("error finding report", error);
    }


})