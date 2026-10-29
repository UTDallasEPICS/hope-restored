import { defineEventHandler, getRequestURL } from "h3";
import { requireSession } from "~/server/utils/auth";

const STAFF_PROTECTED_PREFIXES = [
  "/api/checkout",
  "/api/inventory",
  "/api/reports",
  "/api/activity",
  "/api/resource/create",
  "/api/resource/update",
  "/api/resource/delete",
];

const ADMIN_PROTECTED_PREFIXES = ["/api/amend", "/api/user/accounts"];

function matchesPrefix(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export default defineEventHandler(async (event) => {
  const method = event.node.req.method?.toUpperCase();
  if (method === "OPTIONS") return;

  const path = getRequestURL(event).pathname.toLowerCase();
  if (!path.startsWith("/api/")) return;

  if (path.startsWith("/api/auth/")) return;

  if (ADMIN_PROTECTED_PREFIXES.some((prefix) => matchesPrefix(path, prefix))) {
    await requireSession(event, "admin");
    return;
  }

  if (STAFF_PROTECTED_PREFIXES.some((prefix) => matchesPrefix(path, prefix))) {
    await requireSession(event, "staff");
  }
});
