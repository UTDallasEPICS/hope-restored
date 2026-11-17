import { navigateTo, useNuxtApp, useRequestFetch, useRoute } from "nuxt/app";
import { qrLoginTarget } from "../utils/permissions";

/** Capture the request context in setup so server-rendered requests forward session cookies. */
export function useAuthenticatedFetch() {
  const requestFetch = useRequestFetch();
  const nuxtApp = useNuxtApp();
  const route = useRoute();

  return async function authenticatedFetch<T>(path: string, options: Parameters<typeof requestFetch>[1] = {}) {
    try {
      return await requestFetch<T>(path, { ...options, credentials: "include" });
    } catch (error) {
      if ((error as { statusCode?: number })?.statusCode === 401) {
        const redirect = qrLoginTarget(route.path);
        await nuxtApp.runWithContext(() => navigateTo(redirect ? { path: "/login", query: { redirect } } : "/login"));
      }
      throw error;
    }
  };
}
  