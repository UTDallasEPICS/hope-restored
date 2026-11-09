import { createError, defineEventHandler, getRouterParam, readBody } from "h3";
import { requireSession } from "../../utils/auth";
import { getQRItem } from "../../utils/qr-item";
import { addInventory } from "~/server/utils/add-inventory.ts";

export default defineEventHandler(async (event) => {
  const session = await requireSession(event, "scanner");
  const item = await getQRItem(getRouterParam(event, "code", { decode: true }));
  const body = await readBody(event);
  if (!Number.isSafeInteger(body?.quantity) || body.quantity < 1) {
    throw createError({ statusCode: 400, message: "Enter a whole-number quantity of 1 or greater." });
  }
  // Item attributes come from the QR catalog, never from the submitted body.
  return addInventory({ ...item, quantity: body.quantity }, session.user);
});
