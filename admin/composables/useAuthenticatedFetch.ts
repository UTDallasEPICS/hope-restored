import { navigateTo, useNuxtApp, useRequestFetch } from "nuxt/app";

/** Capture the request context in setup so server-rendered requests forward session cookies. */
export function useAuthenticatedFetch() {
  const requestFetch = useRequestFetch();
  const nuxtApp = useNuxtApp();

  return async function authenticatedFetch<T>(path: string, options: Parameters<typeof requestFetch>[1] = {}) {
    try {
      return await requestFetch<T>(path, { ...options, credentials: "include" });
    } catch (error) {
      if ((error as { statusCode?: number })?.statusCode === 401) {
        await nuxtApp.runWithContext(() => navigateTo("/login"));
      }
      throw error;
    }
  };
}
