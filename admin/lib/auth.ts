import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

function parseCsv(value: string | undefined): string[] {
	return (value || "")
		.split(",")
		.map((v) => v.trim())
		.filter(Boolean);
}

function getTrustedOrigins() {
	const envTrusted = parseCsv(process.env.BETTER_AUTH_TRUSTED_ORIGINS);
	const fallback = [
		"http://localhost:3000",
		"http://localhost:3001",
		"http://127.0.0.1:3000",
		"http://127.0.0.1:3001",
		"http://localhost:4000",
		"http://127.0.0.1:4000",
	];
	return [...new Set([...fallback, ...envTrusted])];
}

export const auth = betterAuth({
	appName: "Hope Restored Admin",
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	basePath: "/api/auth",
	secret: process.env.BETTER_AUTH_SECRET,
	database: prismaAdapter(prisma, {
		provider: "sqlite",
	}),
	trustedOrigins: getTrustedOrigins(),
	emailAndPassword: {
		enabled: true,
	},
	session: {
		expiresIn: 60 * 60 * 12,
		updateAge: 60 * 15,
	},
	advanced: {
		useSecureCookies: process.env.NODE_ENV === "production",
		defaultCookieAttributes: {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			path: "/",
		},
	},
	telemetry: {
		enabled: false,
	},
});

