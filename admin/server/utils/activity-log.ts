import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { type H3Event, getRequestURL } from "h3";
import { randomUUID } from "node:crypto";
import { getRequestSession } from "~/server/utils/auth";

export type ActivityLogEntry = {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  actor: string;
  actorEmail: string | null;
  ip: string | null;
  userAgent: string | null;
  summary?: string | null;
  details?: string[] | null;
};

const ACTIVITY_LOG_PATH = resolve(process.cwd(), ".data/activity-log.json");
const MAX_ENTRIES = 5000;

async function ensureStoreDir() {
  await mkdir(dirname(ACTIVITY_LOG_PATH), { recursive: true });
}

export async function readActivityLog(): Promise<ActivityLogEntry[]> {
  try {
    const raw = await readFile(ACTIVITY_LOG_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean) as ActivityLogEntry[];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err?.code === "ENOENT") return [];
    throw error;
  }
}

export async function appendActivityLog(entry: ActivityLogEntry) {
  const existing = await readActivityLog();
  existing.unshift(entry);
  await ensureStoreDir();
  await writeFile(
    ACTIVITY_LOG_PATH,
    JSON.stringify(existing.slice(0, MAX_ENTRIES), null, 2),
    "utf8",
  );
}

function getRequestIp(event: H3Event) {
  const forwarded = event.node.req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return event.node.req.socket.remoteAddress || null;
}

type LogActivityOptions = {
  method?: string;
  path?: string;
  summary?: string | null;
  details?: string[] | null;
};

export async function logActivityEvent(event: H3Event, options: LogActivityOptions = {}) {
  let actor = "Unknown";
  let actorEmail: string | null = null;

  try {
    const session = await getRequestSession(event);
    const email = (session?.user as { email?: string } | undefined)?.email;
    if (email) {
      actor = email;
      actorEmail = email;
    }
  } catch {
    // Best-effort only.
  }

  const method = options.method || event.node.req.method?.toUpperCase() || "UNKNOWN";
  const path = options.path || getRequestURL(event).pathname;

  await appendActivityLog({
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    method,
    path,
    actor,
    actorEmail,
    ip: getRequestIp(event),
    userAgent: event.node.req.headers["user-agent"] || null,
    summary: options.summary || null,
    details: options.details || null,
  });
}
