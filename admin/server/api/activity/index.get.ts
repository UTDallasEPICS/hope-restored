import { defineEventHandler, getQuery } from "h3";
import { readActivityLog } from "~/server/utils/activity-log";

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

  const entries = await readActivityLog();
  const filtered = entries.filter((entry) => {
    if (method && normalize(entry.method) !== method) return false;
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
