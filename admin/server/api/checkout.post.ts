import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody } from 'h3'
import { DateTime } from "luxon";

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const removals = body.removals

    if (!removals || !Array.isArray(removals)) {
      throw new Error('Invalid request body. Expected an array of removals.')
    }

    const todayCST = DateTime.now()
      .setZone("America/Chicago")
      .startOf("day");

    const today = todayCST.toJSDate();

    for (const { category, quantity } of removals) {
      // Add entry to Removals
      await prisma.removals.create({
        data: {
          category,
          dateRemoved: today,
          quantity,
        },
      })

      // Find today’s Inventory record for that category
      const record = await prisma.inventoryRecords.findFirst({
        where: { category, date: today },
      })

      // Update the quantity (subtracting the removed amount)
      if (record) {
        await prisma.inventoryRecords.update({
          where: { id: record.id },
          data: { quantity: record.quantity - quantity },
        })
      } else {
        throw new Error(`Inventory record not found for category: ${category} on date: ${today.toISOString().slice(0, 10)}`)
      }
    }

    return { success: true, message: 'Checkout processed successfully.' }
  } catch (error) {
    console.error('Checkout error:', error)
    return { success: false, message: (error instanceof Error ? error.message : String(error)) }
  }
})
