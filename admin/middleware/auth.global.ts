import { defineNuxtRouteMiddleware, navigateTo, useRequestHeaders } from "nuxt/app";
import { authClient } from "~/lib/auth-client";
import type { RouteLocationNormalized } from "vue-router";

const PUBLIC_PATHS = new Set(["/", "/Home", "/login"]);
const ADMIN_PATHS = new Set(["/admin", "/accounts"]); //new admin paths 

function hasActiveSession(session: { user?: unknown; session?: unknown } | null) {
  return Boolean(session?.user && session?.session);
}

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  if (PUBLIC_PATHS.has(to.path)) {
    return;
  }

  try {
    const cookieHeader = import.meta.server
      ? useRequestHeaders(["cookie"]).cookie
      : undefined;

    const { data: session } = await authClient.getSession({
      fetchOptions: {
        credentials: "include",
        headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      },
    });

    if (!hasActiveSession(session)) {
      return navigateTo("/login");
    }

    const isAdminPath = [...ADMIN_PATHS].some(
      (path) => to.path === path || to.path.startsWith(`${path}/`),
    );
    const user = session?.user;
    const isAdmin = user && "role" in user && user.role === "admin";

    if (isAdminPath && !isAdmin) {
      return navigateTo("/Home");
    }
  } catch (error) {
    console.warn("Session check failed for", to.path, error);
    return navigateTo("/login");
  }
});
