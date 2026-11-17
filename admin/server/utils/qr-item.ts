import { createError } from "h3";
import { getQRCatalog } from "../../composables/inventorySizes";
import { readQRTypes } from "./qr-types";

export async function getQRItem(code: string | undefined) {
  const item = getQRCatalog(await readQRTypes()).find((item) => item.code === code);
  if (!item) throw createError({ statusCode: 404, message: "Unknown item QR code." });
  return item;
}
