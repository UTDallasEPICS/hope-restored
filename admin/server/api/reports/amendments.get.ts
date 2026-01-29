import { defineEventHandler, getQuery } from 'h3';
import prisma from '../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const start = query.start as string | undefined;
  const end = query.end as string | undefined;

  if (!start || !end) {
    return [];
  }

  try {
    // Parse the dates
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    // Find all unique dates in the range that have Additions or Removals
    // (amendments are tracked via Additions/Removals tables)
    const [additions, removals] = await Promise.all([
      prisma.additions.findMany({
        where: {
          dateAdded: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          dateAdded: true,
        },
        distinct: ['dateAdded'],
      }),
      prisma.removals.findMany({
        where: {
          dateRemoved: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          dateRemoved: true,
        },
        distinct: ['dateRemoved'],
      }),
    ]);

    // Combine and deduplicate dates
    const amendedDates = new Set<string>();
    additions.forEach(a => {
      const dateStr = a.dateAdded.toISOString().split('T')[0];
      amendedDates.add(dateStr);
    });
    removals.forEach(r => {
      const dateStr = r.dateRemoved.toISOString().split('T')[0];
      amendedDates.add(dateStr);
    });

    // Return array of date strings (the frontend normalizes this)
    return Array.from(amendedDates);
  } catch (error) {
    console.error('Error fetching amendments:', error);
    return [];
  }
});
