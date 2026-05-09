import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { authClient } from "~/lib/auth-client";
import type { RouteLocationNormalized } from "vue-router";

const PUBLIC_PATHS = new Set(["/", "/Home", "/login"]);

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Avoid SSR redirecting to /login on full-page refresh.
  // Let the client perform the auth/session check after hydration.
  if (typeof window === "undefined") return;

  const navEntries =
    typeof performance.getEntriesByType === "function"
      ? performance.getEntriesByType("navigation")
      : [];
  const isReload =
    navEntries.length > 0
      ? (navEntries[0] as PerformanceNavigationTiming).type === "reload"
      : performance.navigation?.type === 1;

  // On client reload, keep users on the current route.
  if (isReload && to.path !== "/login") {
    return;
  }

  if (PUBLIC_PATHS.has(to.path)) {
    return;
  }

  try {
    const { data: session } = await authClient.getSession();

    if (!session) {
      return navigateTo("/login");
    }
  } catch {
    return navigateTo("/login");
  }
});
