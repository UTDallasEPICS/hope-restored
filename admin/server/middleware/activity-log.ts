import { defineEventHandler, getRequestURL } from "h3";
import { logActivityEvent } from "~/server/utils/activity-log";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const EXCLUDED_PREFIXES = [
  "/api/auth/",
  "/api/activity",
  "/api/checkout",
  "/api/inventory",
];

export default defineEventHandler(async (event) => {
  const method = event.node.req.method?.toUpperCase() || "";
  if (!WRITE_METHODS.has(method)) return;

  const path = getRequestURL(event).pathname;
  if (!path.startsWith("/api/")) return;
  if (EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix))) return;

  try {
    await logActivityEvent(event, {});
  } catch (error) {
    console.error("Failed to append activity log", error);
  }
});
