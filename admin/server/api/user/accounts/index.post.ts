import { createError, defineEventHandler, readBody, setResponseStatus } from "h3";
import prisma from "~/lib/prisma";
import { requireSession } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  await requireSession(event, "admin");
  const body = await readBody(event);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!name || name.length > 200 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: "A name and valid email are required." });
  }
  if (body.role !== undefined && body.role !== "staff") {
    throw createError({ statusCode: 400, message: "Only staff accounts can be created." });
  }

  try {
    // Staff sign in through email OTP; no password or administrator session is created.
    const user = await prisma.user.create({
      data: { name, email, role: "staff", emailVerified: false },
      select: { id: true, name: true, email: true, role: true },
    });
    setResponseStatus(event, 201);
    return user;
  } catch (error) {
    if ((error as { code?: string })?.code === "P2002") {
      throw createError({ statusCode: 409, message: "An account with this email already exists." });
    }
    throw error;
  }
});
