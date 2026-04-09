import { createError, getHeaders } from "h3";
import { auth } from "~/lib/auth";

type AppRole = "staff" | "admin";

type SessionUserLike = {
  role?: string | null;
  email?: string | null;
};

function parseCsv(value: string | undefined): string[] {
  return (value || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

function hasRequiredRole(
  user: SessionUserLike,
  requiredRole: AppRole,
  adminEmails: string[],
  staffEmails: string[],
) {
  const userRole = (user.role || "").toLowerCase();
  const userEmail = (user.email || "").toLowerCase();
  const isAdmin = userRole === "admin" || adminEmails.includes(userEmail);
  const isStaff =
    isAdmin || userRole === "staff" || staffEmails.includes(userEmail);

  if (requiredRole === "admin") return isAdmin;
  return isStaff;
}

export async function getRequestSession(event: Parameters<typeof getHeaders>[0]) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(getHeaders(event))) {
    if (typeof value === "string") {
      headers.set(key, value);
    }
  }

  const session = await auth.api.getSession({
    headers,
  });
  return session;
}

export async function requireSession(
  event: Parameters<typeof getHeaders>[0],
  requiredRole: AppRole = "staff",
) {
  const session = await getRequestSession(event);

  if (!session?.session || !session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Please sign in to continue.",
    });
  }

  const config = useRuntimeConfig(event);
  const adminEmails = parseCsv(config.betterAuthAdminEmails);
  const staffEmails = parseCsv(config.betterAuthStaffEmails);

  if (
    !hasRequiredRole(
      session.user as SessionUserLike,
      requiredRole,
      adminEmails,
      staffEmails,
    )
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "You do not have permission for this action.",
    });
  }

  return session;
}
