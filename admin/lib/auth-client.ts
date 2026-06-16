import { createAuthClient } from "better-auth/vue";
import { emailOTPClient } from "better-auth/client/plugins";

function resolveAuthBaseURL() {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}
	return undefined;
}

export const authClient = createAuthClient({
	baseURL: resolveAuthBaseURL(),
	plugins: [emailOTPClient()],
});

