import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default defineEventHandler(async () =>{
    console.log("API called");
    try{
        const inv = await prisma.inventory.findMany();
        const curDate = new Date()
        curDate.setHours(0,0,0,0);
        const recordRows:{
            code: string,
            quantity: number,
            additions: number, 
            removals: number, 
            category: string,
            size: string | null,
            gender: string | null,
            date: Date 
        }[] =[]
        for (const item of inv){
        recordRows.push({
            code: item.code,
            quantity: item.quantity,
            additions: item.additions, 
            removals: item.removals,
            category: item.category,
            size: item.size,
            gender: item.gender,
            date: curDate
        }) 
        }  
        const record = await prisma.inventoryRecords.createMany({
            data:recordRows
        })
        await prisma.inventory.updateMany({
            where:{
                code:{
                    not:''
                }
            },
            data:{
                additions:0,
                removals:0
            }
        })
        console.log("inv record created")
    }catch(error){
        console.log("Error:", error)
    }
    

    
})
