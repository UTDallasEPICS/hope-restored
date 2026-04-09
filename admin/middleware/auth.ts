import { authClient } from "~/lib/auth-client";

const PUBLIC_PATHS = new Set(["/", "/Home"]);

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_PATHS.has(to.path)) {
    return;
  }

  try {
    const { data: session } = await authClient.useSession(useFetch);
    if (!session.value) {
      return navigateTo("/");
    }
  } catch {
    return navigateTo("/");
  }
});
