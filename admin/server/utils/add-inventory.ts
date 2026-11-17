import { createError } from "h3";
import prisma from "~/lib/prisma";

type InventoryAddition = {
  category: string;
  gender?: string;
  size?: string;
  quantity: number;
};

/** Shared by staff inventory entry and the restricted QR addition endpoint. */
export async function addInventory(entry: InventoryAddition, user: { email?: string | null; name?: string | null }) {
  const invCode = String(entry.category) + String(entry.size ?? "") + String(entry.gender ?? "");

  try {
    await prisma.inventory.upsert({
      where: { code: invCode },
      create: {
        code: invCode,
        category: entry.category,
        gender: entry.gender ?? "",
        size: entry.size ?? "",
        quantity: entry.quantity,
        additions: entry.quantity,
      },
      update: {
        quantity: { increment: entry.quantity },
        additions: { increment: entry.quantity },
      },
    });

    try {
      await prisma.activityLog.create({
        data: {
          email: user.email ?? "",
          name: user.name ?? user.email ?? "Unknown User",
          category: entry.category,
          gender: entry.gender ?? "",
          size: entry.size ?? "",
          action: "Addition",
          amount: entry.quantity,
        },
      });
    } catch (logErr) {
      console.warn("ActivityLog create failed (inventory was still updated):", logErr);
    }

    return { success: true };
  } catch (error) {
    console.error("Error inserting inventory:", error);
    throw createError({ statusCode: 500, message: "An error occurred while saving the item. Please try again." });
  }
}
