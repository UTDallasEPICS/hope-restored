require('dotenv').config();
console.log('env DATABASE_URL:', process.env.DATABASE_URL);
const { PrismaClient } = require('@prisma/client');
(async ()=>{
  const p = new PrismaClient();
  try{
    // engine config can be under p._engineConfig in some Prisma versions
    console.log('prisma engine config datasources:', p._engineConfig ? p._engineConfig.datasources : 'n/a');
  }catch(e){
    console.error('ERR',e);
  }finally{
    await p.$disconnect();
  }
})();
