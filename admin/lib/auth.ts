import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import nodemailer from "nodemailer";
import { resolve } from "node:path";
import prisma from "./prisma";

const envCandidates = [resolve(process.cwd(), ".env"), resolve(process.cwd(), "admin/.env")];
const resolvedEnvPath = envCandidates.find((path) => existsSync(path));

if (resolvedEnvPath) {
	loadEnv({ path: resolvedEnvPath });
} else {
	loadEnv();
}

const smtpPort = Number.parseInt((process.env.SMTP_PORT || "587").split("#")[0].trim(), 10) || 587;

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "smtp.gmail.com",
	port: smtpPort,
	secure: smtpPort === 465,
  requireTLS: smtpPort === 587,
  from: process.env.SMTP_FROM,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
	tls: {
		rejectUnauthorized: true,
	},
});

function parseCsv(value: string | undefined): string[] {
	return (value || "")
		.split(",")
		.map((v) => v.trim())
		.filter(Boolean);
}

function getTrustedOrigins() {
	const envTrusted = parseCsv(process.env.BETTER_AUTH_TRUSTED_ORIGINS);
	const port = process.env.PORT || "3000";
	const fallback = [
		"http://localhost:3000",
		"http://localhost:3001",
		`http://localhost:${port}`,
		"http://127.0.0.1:3000",
		"http://127.0.0.1:3001",
		`http://127.0.0.1:${port}`,
		"http://localhost:4000",
		"http://127.0.0.1:4000",
	];
	return [...new Set([...fallback, ...envTrusted])];
}

/** Home Wi‑Fi / LAN URLs used when testing on a phone (npm run dev -- --host). */
function isLocalDevOrigin(origin: string | null) {
	if (!origin) return false;
	try {
		const { hostname, protocol } = new URL(origin);
		if (protocol !== "http:" && protocol !== "https:") return false;
		if (hostname === "localhost" || hostname === "127.0.0.1") return true;
		if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
		if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
		if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
		return false;
	} catch {
		return false;
	}
}

const isProd = process.env.NODE_ENV === "production";

function getAuthBaseURL() {
	if (isProd) {
		return process.env.BETTER_AUTH_URL || "http://localhost:3000";
	}
	const port = process.env.PORT || "3000";
	return {
		allowedHosts: [
			`localhost:${port}`,
			`127.0.0.1:${port}`,
			`192.168.*:${port}`,
			`10.*:${port}`,
			`172.*:${port}`,
		],
		protocol: "http" as const,
	};
}

export const auth = betterAuth({
	appName: "Hope Restored Admin",
	baseURL: getAuthBaseURL(),
	basePath: "/api/auth",
	secret: process.env.BETTER_AUTH_SECRET,
	database: prismaAdapter(prisma, {
		provider: "sqlite",
	}),
	trustedOrigins: async (request) => {
		const origins = getTrustedOrigins();
		if (!request) return origins;
		const origin = request.headers.get("origin");
		if (!isProd && origin && isLocalDevOrigin(origin)) {
			return [...new Set([...origins, origin])];
		}
		return origins;
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "staff",
				input: false,
			},
		},
	},
	emailAndPassword: {
		enabled: true,
	},
		plugins: [
			emailOTP({
				async sendVerificationOTP({ email, otp, type }) {
					const from = process.env.SMTP_FROM || process.env.SMTP_USER;
					const subject = type === "sign-in" ? "Your login code" : "Verify your email";
					if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !from) {
						if (process.env.NODE_ENV !== "production") {
							console.info(
								`[DEV OTP] ${type} for ${email}: ${otp} (expires in 10 minutes)`,
							);
							return;
						}
						throw new Error("SMTP is not configured. Set SMTP_USER, SMTP_PASS, and SMTP_FROM in admin/.env");
					}

				try {
					await transporter.sendMail({
						from,
						to: email,
						subject,
						text: `Your verification code is: ${otp}`,
						html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
					});
				} catch (error) {
					const msg = error instanceof Error ? error.message : String(error);
					console.error("Failed to send OTP email:", msg);
					throw new Error(`Failed to send OTP email: ${msg}`);
				}
			},
			otpLength: 6,
			expiresIn: 600,
		}),
	],
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
