import { defineNuxtRouteMiddleware, navigateTo, useRequestHeaders } from "nuxt/app";
import { authClient } from "~/lib/auth-client";
import type { RouteLocationNormalized } from "vue-router";

const PUBLIC_PATHS = new Set(["/", "/Home", "/login"]);

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
  } catch (error) {
    console.warn("Session check failed for", to.path, error);
    return navigateTo("/login");
  }
});
