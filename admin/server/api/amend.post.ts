import prisma from '@/lib/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { selectedDate, category, quantity, action } = body

  if (!selectedDate || !category || !quantity || !action) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const date = new Date(selectedDate)
  // Convert to noon US Central Time
  const dateAtNoon = new Date(date)
  dateAtNoon.setHours(12, 0, 0, 0)

  if (action === 'Remove') {
    // Check inventory before removing
    const record = await prisma.inventoryRecords.findFirst({
      where: { date: dateAtNoon, category }
    })

    if (!record) {
      throw createError({ statusCode: 400, message: 'No inventory record found for this date and category' })
    }

    if (record.quantity < quantity) {
      throw createError({ statusCode: 400, message: 'Cannot remove more items than there are in selected date\'s inventory.' })
    }

    // Update inventory
    await prisma.inventoryRecords.update({
      where: { id: record.id },
      data: { quantity: record.quantity - quantity }
    })

    // Add to Removals
    await prisma.removals.create({
      data: { category, dateRemoved: dateAtNoon, quantity }
    })
  } else if (action === 'Add') {
    // Add to inventory (either update existing or create)
    const existing = await prisma.inventoryRecords.findFirst({
      where: { date: dateAtNoon, category }
    })

    if (existing) {
      await prisma.inventoryRecords.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      })
    } else {
      await prisma.inventoryRecords.create({
        data: { category, date: dateAtNoon, quantity }
      })
    }

    // Add to Additions table
    await prisma.additions.create({
      data: { category, dateAdded: dateAtNoon, quantity }
    })
  }

  return { success: true }
})