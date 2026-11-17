export type AppRole = "staff" | "admin" | "scanner";

export function normalizedPath(path: string) {
  try {
    path = decodeURIComponent(path);
  } catch {
    // Let the router reject malformed URLs.
  }
  return path.replace(/\/+$/, "").toLowerCase() || "/";
}

export function matchesPath(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function isQRItemPath(path: string) {
  const normalized = normalizedPath(path);
  return /^\/qr-code\/[^/]+$/.test(normalized) && normalized !== "/qr-code/new";
}

export function canAccessPage(role: string | null | undefined, path: string) {
  const normalized = normalizedPath(path);
  if (["/", "/home", "/login"].includes(normalized)) return true;
  if (role === "admin") return true;
  if (role === "staff") {
    return isQRItemPath(path) || ["/inventory", "/checkout", "/reports"].some((prefix) => matchesPath(normalized, prefix));
  }
  return role === "scanner" && isQRItemPath(path);
}

/** Only resume a local scanned-item URL after login. */
export function qrLoginTarget(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/qr-code/") || value.includes("\\")) return;
  const path = value.split(/[?#]/)[0];
  if (isQRItemPath(path)) return path;
}
