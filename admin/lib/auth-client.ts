import { createAuthClient } from "better-auth/vue";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	// basePath: "/api/auth",
	plugins: [emailOTPClient()],
});

