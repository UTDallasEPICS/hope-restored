import { createError, defineEventHandler, readBody } from "h3";
import { requireSession } from "~/server/utils/auth";
import { addInventory } from "~/server/utils/add-inventory.ts";

export default defineEventHandler(async (event) => {
  const session = await requireSession(event, "staff");
  const entry = await readBody(event);

  if (!entry?.category || entry.quantity == null) {
    throw createError({
      statusCode: 400,
      message: "Category and quantity are required.",
    });
  }

  return addInventory(entry, session.user);
});
