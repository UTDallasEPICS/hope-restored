import { defineNuxtRouteMiddleware, navigateTo, useRequestHeaders } from "nuxt/app";
import { authClient } from "~/lib/auth-client";
import { canAccessPage, normalizedPath } from "~/utils/permissions";
import type { RouteLocationNormalized } from "vue-router";

const PUBLIC_PATHS = new Set(["/", "/Home", "/login"]);

function hasActiveSession(session: { user?: unknown; session?: unknown } | null) {
  return Boolean(session?.user && session?.session);
}

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  if (normalizedPath(to.path) === "/login") return;

  let session;
  try {
    const cookieHeader = import.meta.server
      ? useRequestHeaders(["cookie"]).cookie
      : undefined;

    const result = await authClient.getSession({
      fetchOptions: {
        credentials: "include",
        headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      },
    });

    session = result.data;
  } catch (error) {
    console.warn("Session check failed for", to.path, error);
  }

  if (!hasActiveSession(session ?? null)) {
    if (PUBLIC_PATHS.has(to.path)) return;
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }

  if (!canAccessPage(session?.user.role, to.path)) {
    return navigateTo("/Home");
  }
});
