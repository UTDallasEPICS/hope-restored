import { defineEventHandler, getRouterParam } from "h3";
import { requireSession } from "../../utils/auth";
import { getQRItem } from "../../utils/qr-item";

export default defineEventHandler(async (event) => {
  await requireSession(event, "scanner");
  return getQRItem(getRouterParam(event, "code", { decode: true }));
});
