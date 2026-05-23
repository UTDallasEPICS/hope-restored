import { defineEventHandler, getQuery } from "h3";
import prisma from "~/lib/prisma";
import { readActivityLog } from "~/server/utils/activity-log";
import type { ActivityLogEntry } from "~/server/utils/activity-log";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search = typeof query.search === "string" ? normalize(query.search) : "";
  const method = typeof query.method === "string" ? normalize(query.method) : "";
  const limitRaw = Number.parseInt(String(query.limit || "200"), 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.max(1, Math.min(limitRaw, 1000))
    : 200;

  const [fileEntries, dbEntriesRaw] = await Promise.all([
    readActivityLog(),
    (prisma as any).activityLog.findMany({
      orderBy: { time: "desc" },
      take: 1000,
    }),
  ]);

  const dbEntries: ActivityLogEntry[] = dbEntriesRaw.map((row: any) => {
    const isRemoval = String(row.action || "").toLowerCase() === "removal";
    const method = isRemoval ? "DELETE" : "POST";
    const path = isRemoval ? "/api/checkout" : "/api/inventory";
    const category = row.category || "Unknown";
    const amount = Number(row.amount ?? 0);
    const size = row.size || "N/A";
    const gender = row.gender || "N/A";

    return {
      id: `db-${row.id}`,
      timestamp: new Date(row.time).toISOString(),
      method,
      path,
      actor: row.name || row.email || "Unknown",
      actorEmail: row.email || null,
      ip: null,
      userAgent: null,
      summary: `${isRemoval ? "Removed" : "Added"} ${amount} item(s) of ${category}`,
      details: [
        `Category: ${category}`,
        `Amount: ${amount}`,
        `Size: ${size}`,
        `Gender: ${gender}`,
      ],
    };
  });

  const entries = [...dbEntries, ...fileEntries].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  const filtered = entries.filter((entry) => {
    if (method === "updated") {
      if (!["put", "patch"].includes(normalize(entry.method))) return false;
    } else if (method && normalize(entry.method) !== method) {
      return false;
    }
    if (!search) return true;
    return (
      normalize(entry.path).includes(search) ||
      normalize(entry.actor).includes(search) ||
      normalize(entry.ip || "").includes(search) ||
      normalize(entry.summary || "").includes(search) ||
      normalize((entry.details || []).join(" ")).includes(search)
    );
  });

  return filtered.slice(0, limit);
});
