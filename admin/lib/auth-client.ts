import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
	basePath: "/api/auth",
});

