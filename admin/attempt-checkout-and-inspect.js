const { PrismaClient } = require('@prisma/client');
const http = require('http');

const ports = Array.from({ length: 11 }, (_, i) => 3000 + i);

async function probePort(port) {
  return new Promise((res) => {
    const req = http.request({ method: 'GET', hostname: 'localhost', port, path: '/', timeout: 1000 }, (r) => {
      res(true);
    });
    req.on('error', () => res(false));
    req.on('timeout', () => { req.destroy(); res(false); });
    req.end();
  });
}

async function postCheckout(port, payload) {
  try {
    const url = `http://localhost:${port}/api/checkout`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ removals: payload }),
    });
    const data = await res.text();
    return { status: res.status, body: data };
  } catch (e) {
    return { error: String(e) };
  }
}

(async () => {
  const p = new PrismaClient();
  try {
    console.log('Probing ports 3000-3010...');
    const up = [];
    for (const port of ports) {
      const ok = await probePort(port);
      if (ok) up.push(port);
    }
    console.log('Up ports:', up);

    const aggBefore = await p.inventoryRecords.aggregate({ _sum: { quantity: true } });
    console.log('InventoryRecords total BEFORE:', aggBefore._sum.quantity ?? 0);
    const rowsBefore = await p.inventoryRecords.findMany({ orderBy: { date: 'asc' } });
    console.log('InventoryRecords rows BEFORE sample:', rowsBefore.slice(0, 10));

    if (up.length === 0) {
      console.log('No running server detected on ports 3000-3010. Exiting.');
      process.exit(0);
    }

    for (const port of up) {
      console.log('\nTRY PORT', port);
      const result = await postCheckout(port, [{ category: 'Shirts', quantity: 1 }]);
      console.log('POST result:', result);

      const aggAfter = await p.inventoryRecords.aggregate({ _sum: { quantity: true } });
      console.log('InventoryRecords total AFTER trying port', port, ':', aggAfter._sum.quantity ?? 0);
      const rowsAfter = await p.inventoryRecords.findMany({ orderBy: { date: 'asc' } });
      console.log('InventoryRecords rows AFTER sample:', rowsAfter.slice(0, 10));
    }
  } catch (e) {
    console.error('ERR', e);
  } finally {
    await p.$disconnect();
  }
})();
