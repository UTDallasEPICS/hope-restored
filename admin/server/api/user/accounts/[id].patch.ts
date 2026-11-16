import { createError, defineEventHandler, getRouterParam, readBody } from "h3";
import prisma from "~/lib/prisma";
import { requireSession } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  await requireSession(event, "admin");
  const id = getRouterParam(event, "id", { decode: true });
  if (!id?.trim()) {
    throw createError({ statusCode: 400, message: "An account ID is required." });
  }

  const body = await readBody(event);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const role = body?.role;
  if (body?.email !== undefined) {
    throw createError({ statusCode: 400, message: "Email cannot be changed." });
  }
  if (!name || name.length > 200) {
    throw createError({ statusCode: 400, message: "A name of up to 200 characters is required." });
  }
  if (role !== "admin" && role !== "staff" && role !== "scanner") {
    throw createError({ statusCode: 400, message: "Choose an admin, staff, or scanner role." });
  }

  try {
    return await prisma.user.update({
      where: { id },
      data: { name, role },
      select: { id: true, name: true, email: true, role: true },
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "P2025") {
      throw createError({ statusCode: 404, message: "Account not found." });
    }
    throw error;
  }
});
