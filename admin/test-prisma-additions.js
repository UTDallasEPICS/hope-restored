const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.additions.findMany({ take: 10 });
    console.log('Additions rows:', rows);
  } catch (e) {
    console.error('Error querying Additions:', e);
  } finally {
    await prisma.$disconnect();
  }
})();