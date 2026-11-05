import { createError, getHeaders } from "h3";
import { auth } from "~/lib/auth";
import prisma from "~/lib/prisma";
import type { AppRole } from "~/utils/permissions";

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
  if (!session?.session || !session?.user) return null;
  // Always use the current role so a scanner cannot retain old staff/admin permissions.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!dbUser) return null;
  return { ...session, user: { ...session.user, role: dbUser.role } };
}

/** Requires any signed-in user, with no staff/admin role check. */
export async function requireLogin(event: Parameters<typeof getHeaders>[0]) {
  const session = await getRequestSession(event);

  if (!session?.session || !session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Please sign in to continue.",
    });
  }

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

  if (requiredRole === "admin" || requiredRole === "scanner") {
    const allowed = session.user.role === "admin"
      || (requiredRole === "scanner" && (session.user.role === "scanner" || session.user.role === "staff"));
    if (!allowed) {
      throw createError({ statusCode: 403, message: requiredRole === "admin"
        ? "Administrator access is required."
        : "Scanner, staff, or administrator access is required." });
    }
    return session;
  }

  // A scanner must never inherit staff access from development mode or an email allowlist.
  if (session.user.role === "scanner") {
    throw createError({ statusCode: 403, message: "Scanner accounts can only use item QR codes." });
  }

  const config = useRuntimeConfig(event);
  const adminEmails = parseCsv(config.betterAuthAdminEmails);
  const staffEmails = parseCsv(config.betterAuthStaffEmails);
  const hasRoleAllowlist = adminEmails.length > 0 || staffEmails.length > 0;
  const isProd = process.env.NODE_ENV === "production";

  if (!hasRoleAllowlist && requiredRole === "staff" && !isProd) {
    return session;
  }

  if (!hasRequiredRole(session.user, requiredRole, adminEmails, staffEmails)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message:
        "You do not have permission for this action. Your account needs the staff or admin role, or your email must be listed in BETTER_AUTH_STAFF_EMAILS / BETTER_AUTH_ADMIN_EMAILS in admin/.env.",
    });
  }

  return session;
}
