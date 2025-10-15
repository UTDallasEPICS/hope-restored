// admin/prisma/dailyInventorySnapshot.ts
// Creates daily inventory snapshot at midnight CST
// To schedule: run this file daily via Task Scheduler or cron
// Command: npx tsx admin/prisma/dailyInventorySnapshot.ts

import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

async function createDailySnapshot() {
  // Get current time in US Central timezone
  const nowCST = DateTime.now().setZone("America/Chicago");

  // Get today's and yesterday's dates at midnight CST
  const todayMidnightCST = nowCST.startOf("day");
  const yesterdayMidnightCST = todayMidnightCST.minus({ days: 1 });

  console.log(`Creating snapshot for ${todayMidnightCST.toISODate()}...`);

  // Normalize date comparisons: find any record whose date falls on today's day
  const existing = await prisma.inventoryRecords.findFirst({
    where: {
      date: {
        gte: todayMidnightCST.toJSDate(),
        lt: todayMidnightCST.plus({ days: 1 }).toJSDate(),
      },
    },
  });

  if (existing) {
    console.log("Today's records already exist. Skipping.");
    return;
  }

  // Fetch yesterday's records using date range for safety across DST/leap transitions
  const yesterdayRecords = await prisma.inventoryRecords.findMany({
    where: {
      date: {
        gte: yesterdayMidnightCST.toJSDate(),
        lt: yesterdayMidnightCST.plus({ days: 1 }).toJSDate(),
      },
    },
  });

  if (yesterdayRecords.length === 0) {
    console.warn("No records found for yesterday. Cannot create snapshot.");
    return;
  }

  // Build today's records with yesterday's quantities
  const todayRecords = yesterdayRecords.map((record) => ({
    date: todayMidnightCST.toJSDate(),
    category: record.category,
    quantity: record.quantity,
  }));

  // Insert all new records
  await prisma.inventoryRecords.createMany({ data: todayRecords });

  console.log(
    `Inserted ${todayRecords.length} inventory records for ${todayMidnightCST.toISODate()}.`
  );
}

createDailySnapshot()
  .catch((error) => {
    console.error("Error creating daily snapshot:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });