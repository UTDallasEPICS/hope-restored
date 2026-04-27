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
	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				const from = process.env.SMTP_FROM || process.env.SMTP_USER;
				const subject = type === "sign-in" ? "Your login code" : "Verify your email";
				if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !from) {
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

