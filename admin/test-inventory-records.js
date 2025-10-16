const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    const agg = await p.inventoryRecords.aggregate({ _sum: { quantity: true } });
    console.log('InventoryRecords total:', agg._sum.quantity);
    const rows = await p.inventoryRecords.findMany({ take: 10, orderBy: { date: 'asc' } });
    console.log('sample rows:', rows);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await p.$disconnect();
  }
})();