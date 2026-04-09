import { authClient } from "~/lib/auth-client";

const PUBLIC_PATHS = new Set(["/", "/Home", "/login"]);

export default defineNuxtRouteMiddleware(async (to) => {
  try {
    const { data: session } = await authClient.useSession(useFetch);

    // If user is not signed in, only allow public paths.
    if (!session.value && !PUBLIC_PATHS.has(to.path)) {
      return navigateTo("/login");
    }
  } catch {
    if (!PUBLIC_PATHS.has(to.path)) {
      return navigateTo("/login");
    }
  }
});
