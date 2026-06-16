/** Turn $fetch / h3 errors into user-facing text (h3 sets `data.error` to boolean true). */
export function formatApiError(err: unknown, fallback: string): string {
  const e = err as {
    data?: { message?: string; statusMessage?: string; error?: unknown };
    statusMessage?: string;
    message?: string;
    statusCode?: number;
  };

  if (typeof e?.data?.error === "string" && e.data.error.trim()) {
    return e.data.error;
  }
  if (e?.data?.message) return e.data.message;
  if (e?.statusMessage && e.statusMessage !== "Server Error") {
    return e.statusMessage;
  }
  if (e?.data?.statusMessage) return e.data.statusMessage;
  if (e?.message && e.message !== "true") return e.message;
  if (e?.statusCode === 401) {
    return "You are not signed in. Log in again, then try adding the item.";
  }
  if (e?.statusCode === 403) {
    return "Your account does not have staff access to add inventory.";
  }
  return fallback;
}
