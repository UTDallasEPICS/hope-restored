import { defineEventHandler, getQuery } from "h3";
import prisma from "~/lib/prisma";
import { readActivityLog } from "~/server/utils/activity-log";
import type { ActivityLogEntry } from "~/server/utils/activity-log";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

type ActivityLogRow = {
  id: string;
  email: string;
  name: string;
  category: string;
  size: string | null;
  gender: string | null;
  action: string;
  amount: number;
  time: Date;
};

function mapDbRow(row: ActivityLogRow): ActivityLogEntry {
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
}

async function loadDbActivityEntries(): Promise<ActivityLogEntry[]> {
  if (!("activityLog" in prisma) || !prisma.activityLog) {
    return [];
  }
  try {
    const rows = await prisma.activityLog.findMany({
      orderBy: { time: "desc" },
      take: 1000,
    });
    return rows.map(mapDbRow);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "P2021" || code === "P2010") {
      console.warn("ActivityLog table missing; run: npx prisma migrate deploy");
      return [];
    }
    console.warn("ActivityLog query failed, using file log only:", error);
    return [];
  }
}

async function loadFileActivityEntries(): Promise<ActivityLogEntry[]> {
  try {
    return await readActivityLog();
  } catch (error) {
    console.warn("File activity log unavailable:", error);
    return [];
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search = typeof query.search === "string" ? normalize(query.search) : "";
  const method = typeof query.method === "string" ? normalize(query.method) : "";
  const limitRaw = Number.parseInt(String(query.limit || "200"), 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.max(1, Math.min(limitRaw, 1000))
    : 200;

  try {
    const [dbEntries, fileEntries] = await Promise.all([
      loadDbActivityEntries(),
      loadFileActivityEntries(),
    ]);

    const entries = [...dbEntries, ...fileEntries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const filtered = entries.filter((entry) => {
      if (method === "updated") {
        if (!["put", "patch"].includes(normalize(entry.method))) return false;
      } else if (method && normalize(entry.method) !== method) {
        return false;
      }
      if (!search) return true;
      return (
        normalize(entry.actor).includes(search) ||
        normalize(entry.summary || "").includes(search) ||
        normalize((entry.details || []).join(" ")).includes(search)
      );
    });

    return filtered.slice(0, limit);
  } catch (error) {
    console.error("Activity API failed:", error);
    return [];
  }
});
