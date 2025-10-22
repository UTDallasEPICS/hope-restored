import { defineEventHandler } from 'h3'
import prisma from '@/lib/prisma'

export default defineEventHandler(async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get all records for today's date
  const records = await prisma.inventoryRecords.findMany({
    where: {
      date: today,
    },
    select: {
      category: true,
      quantity: true,
    },
  })

  // Build a map of category -> quantity
  const data: Record<string, number> = {}
  for (const record of records) {
    data[record.category] = record.quantity
  }

  return data
})
