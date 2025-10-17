const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    const agg = await p.inventoryRecords.aggregate({ _sum: { quantity: true } });
    console.log('InventoryRecords total:', agg._sum.quantity);
    const rows = await p.inventoryRecords.findMany({ orderBy: { date: 'asc' }, take: 20 });
    console.log('InventoryRecords sample rows:', rows);
    const adds = await p.additions.findMany({ orderBy: { dateAdded: 'desc' }, take: 10 });
    console.log('Recent Additions:', adds);
    const rem = await p.removals.findMany({ orderBy: { dateRemoved: 'desc' }, take: 10 });
    console.log('Recent Removals:', rem);
  } catch (e) {
    console.error('ERR', e);
  } finally {
    await p.$disconnect();
  }
})();
