// amend.post.ts

import { defineEventHandler, readBody } from 'h3'
import prisma from '@/lib/prisma' // Uses existing prisma.ts file in admin/lib

export default defineEventHandler(async (event) => {
  try {
    // Read and destructure request body
    const body = await readBody(event)
    const { selectedDate, category, quantity, action } = body

    // Basic validation (frontend should handle this too)
    if (!selectedDate || !category || !quantity || !action) {
      return {
        success: false,
        message: 'Missing required fields.',
      }
    }

    const date = new Date(selectedDate)
    const isAddition = action === 'Add'

    // Find the Inventory record for this date and category
    const inventoryRecord = await prisma.inventoryRecords.findFirst({
      where: {
        date: date,
        category: category,
      },
    })

    if (!inventoryRecord) {
      return {
        success: false,
        message: 'No inventory record found for that date and category.',
      }
    }

    // If removing, ensure we are not removing more than exists
    if (!isAddition && inventoryRecord.quantity < quantity) {
      return {
        success: false,
        message: 'Cannot remove more items than there are in selected date\'s inventory.',
      }
    }

    // --- STEP 1: Update the InventoryRecord for the selected date ---
    await prisma.inventoryRecords.update({
      where: { id: inventoryRecord.id },
      data: {
        quantity: {
          increment: isAddition ? quantity : -quantity,
        },
      },
    })

    // --- STEP 2: Update all future InventoryRecords for same category ---
    await prisma.inventoryRecords.updateMany({
      where: {
        category: category,
        date: {
          gt: date, // All dates AFTER the selected date
        },
      },
      data: {
        quantity: {
          increment: isAddition ? quantity : -quantity,
        },
      },
    })

    // --- STEP 3: Add entry to Additions or Removals table ---
    const localNoon = new Date(date)
    localNoon.setHours(12, 0, 0, 0) // 12 PM local time (Central)

    if (isAddition) {
      await prisma.additions.create({
        data: {
          category: category,
          quantity: quantity,
          dateAdded: localNoon,
        },
      })
    } else {
      await prisma.removals.create({
        data: {
          category: category,
          quantity: quantity,
          dateRemoved: localNoon,
        },
      })
    }

    // --- STEP 4: Return success ---
    return {
      success: true,
      message: 'Amendment of data successful!',
    }

  } catch (error: any) {
    console.error('Error during amendment:', error)
    return {
      success: false,
      message: 'An unexpected error occurred.',
      details: error.message,
    }
  }
})