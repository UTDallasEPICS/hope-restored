import { PrismaClient } from '@prisma/client';
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
        const firstDates = await prisma.inventoryRecords.findMany({
            where:{
                date:{
                    gte:sd[0],
                    lte:sd[1]
                },
            },
            select:{
                date:true,
                code:true,
                quantity:true
            },
            orderBy:{
                date:'asc'
            }
        });
         const lastDates = await prisma.inventoryRecords.findMany({
            where:{
                date:{
                    gte:ed[0],
                    lte:ed[1]
                }
            },
            select:{
                date:true,
                code:true,
                quantity:true
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
            orderBy:{
                category:'asc',
            }
        });
        const fullReport:{
            code:string,
            category:string,
            gender:string|null,
            size:string|null,
            startQuant:number,
            lastQuant:number, 
            additions:number,
            removals:number
        }[] = [];
        for(const item of aggregations){
            fullReport.push({
                code:item.code,
                category:item.category,
                gender:item.gender,
                size:item.size,
                additions:item._sum.additions? item._sum.additions : 0 ,
                removals:item._sum.removals? item._sum.removals : 0,
                startQuant:0,
                lastQuant:0
            })
        }
        for(const reportRow of fullReport){
            for(const item of firstDates){
                if(reportRow.code == item.code){
                    reportRow.startQuant = item.quantity
                }
            }
            for(const item of lastDates){
                if(reportRow.code == item.code){
                    reportRow.startQuant = item.quantity
                }
            }
        }
        return fullReport

    }catch(error){
        console.log("error finding report", error);
    }


})