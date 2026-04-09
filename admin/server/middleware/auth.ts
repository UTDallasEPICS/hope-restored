import { defineEventHandler, getRequestURL } from "h3";
import { requireSession } from "~/server/utils/auth";

const STAFF_PROTECTED_PREFIXES = [
  "/api/checkout",
  "/api/inventory",
  "/api/reports",
];

const ADMIN_PROTECTED_PREFIXES = ["/api/amend"];

export default defineEventHandler(async (event) => {
  const method = event.node.req.method?.toUpperCase();
  if (method === "OPTIONS") return;

  const path = getRequestURL(event).pathname;
  if (!path.startsWith("/api/")) return;

  if (path.startsWith("/api/auth/")) return;

  if (ADMIN_PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    await requireSession(event, "admin");
    return;
  }

  if (STAFF_PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    await requireSession(event, "staff");
  }
});
