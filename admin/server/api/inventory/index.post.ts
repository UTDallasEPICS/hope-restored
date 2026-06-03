import { createError, defineEventHandler, readBody } from "h3";
import prisma from "~/lib/prisma";
import { requireSession } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const session = await requireSession(event, "staff");
  const userEmail = session.user.email ?? "";
  const userName = session.user.name ?? session.user.email ?? "Unknown User";
  const entry = await readBody(event);

  if (!entry?.category || entry.quantity == null) {
    throw createError({
      statusCode: 400,
      message: "Category and quantity are required.",
    });
  }

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
          email: userEmail,
          name: userName,
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
    throw createError({
      statusCode: 500,
      message: "An error occurred while saving the item. Please try again.",
    });
  }
});
