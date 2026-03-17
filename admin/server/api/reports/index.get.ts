import { PrismaClient } from '@prisma/client';
import { it } from 'node:test';
import prisma from '~/lib/prisma';

export default defineEventHandler(async (event) =>{
    const params = getQuery(event);
    const {startDate, endDate} = params;
    //console.log(params);
  try{
        let sd = [];
        let ed = [];
        if(startDate && endDate){
            sd[0] = new Date(String(startDate)); sd[0].setHours(0,0,0,0);
            sd[1] = new Date(String(startDate)); sd[1].setHours(23,59,59,99);
            ed[0] = new Date(String(endDate)); ed[0].setHours(0,0,0,0);
            ed[1] = new Date(String(endDate)); ed[1].setHours(23,59,59,0);
        }else{
            //default to today
            sd[0] = new Date(); sd[0].setHours(0,0,0,0);
            ed[1] = new Date(); ed[1].setHours(23,59,59,0);
            sd[1] = ed[1]; ed[0] = sd[1];
        }
        const catList = await prisma.inventory.groupBy({
            by:['category'],
        })
         const lastDates = await prisma.inventoryRecords.findMany({
            where:{
                date:{
                    gte:ed[0],
                    lte:ed[1]
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
                    lte:ed[1],
                }
            },
            _sum:{
                additions:true,
                removals:true
            },
            // orderBy:{
            //     category:'asc',
            // }
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
            }[] = []
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
        return groupedData
    }catch(error){
        console.log("error finding report", error);
    }


})