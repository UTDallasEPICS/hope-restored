import { createError, getHeaders } from "h3";
import { auth } from "~/lib/auth";
import prisma from "~/lib/prisma";

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

/** Session payload may omit `role`; load it from the user table when needed. */
async function resolveSessionUser(user: SessionUserLike): Promise<SessionUserLike> {
  if (user.role || !user.email) {
    return user;
  }
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true },
  });
  if (dbUser?.role) {
    return { ...user, role: dbUser.role };
  }
  return user;
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
  const hasRoleAllowlist = adminEmails.length > 0 || staffEmails.length > 0;
  const isProd = process.env.NODE_ENV === "production";

  if (!hasRoleAllowlist && requiredRole === "staff" && !isProd) {
    return session;
  }

  const user = await resolveSessionUser(session.user as SessionUserLike);

  if (!hasRequiredRole(user, requiredRole, adminEmails, staffEmails)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message:
        "You do not have permission for this action. Your account needs the staff or admin role, or your email must be listed in BETTER_AUTH_STAFF_EMAILS / BETTER_AUTH_ADMIN_EMAILS in admin/.env.",
    });
  }

  return session;
}
