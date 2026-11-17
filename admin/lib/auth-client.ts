import { createAuthClient } from "better-auth/vue";
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

function resolveAuthBaseURL() {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}
	return process.env.BETTER_AUTH_URL;
}

export const authClient = createAuthClient({
	baseURL: resolveAuthBaseURL(),
	fetchOptions: { credentials: "include" },
	plugins: [emailOTPClient(), inferAdditionalFields<typeof auth>()],
});

