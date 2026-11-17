import { createError, defineEventHandler, getRequestURL } from "h3";
import { getRequestSession, requireSession } from "~/server/utils/auth";
import { matchesPath, normalizedPath } from "~/utils/permissions";

const STAFF_PROTECTED_PREFIXES = [
  "/api/checkout",
  "/api/inventory",
  "/api/reports",
  "/api/resource/create",
  "/api/resource/update",
  "/api/resource/delete",
  "/api/user/accounts"
];

const ADMIN_PROTECTED_PREFIXES = [
  "/api/amend",
  "/api/user/accounts",
  "/api/activity",
];

export default defineEventHandler(async (event) => {
  const method = event.node.req.method?.toUpperCase();
  if (method === "OPTIONS") return;

  const path = normalizedPath(getRequestURL(event).pathname);
  if (!path.startsWith("/api/")) return;

  if (path.startsWith("/api/auth/")) return;

  if (matchesPath(path, "/api/qr-codes")) {
    const isItemRequest = /^\/api\/qr-codes\/[^/]+$/.test(path) && path !== "/api/qr-codes/types";
    await requireSession(event, isItemRequest && (method === "GET" || method === "POST") ? "scanner" : "admin");
    return;
  }

  // if (ADMIN_PROTECTED_PREFIXES.some((prefix) => matchesPath(path, prefix))) {
  //   await requireSession(event, "admin");
  //   return;
  // }

  if (STAFF_PROTECTED_PREFIXES.some((prefix) => matchesPath(path, prefix))) {
    await requireSession(event, "staff");
    return;
  }

  // Deny scanner access to any other API, including future endpoints.
  const session = await getRequestSession(event);
  if (session?.user.role === "scanner") {
    throw createError({ statusCode: 403, message: "Scanner accounts can only use item QR codes." });
  }
});
