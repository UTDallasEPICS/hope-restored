import { createError, defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import prisma from "~/lib/prisma";
import { requireSession } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const session = await requireSession(event, "admin");
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "An account ID is required." });
  }
  if (id === session.user.id) {
    throw createError({ statusCode: 403, message: "You cannot delete your own account." });
  }

  // Filter within the delete to prevent removing an account promoted to admin concurrently.
  // The schema cascades deletion to the user's sessions and linked accounts.
  const result = await prisma.user.deleteMany({ where: { id, role: { in: ["staff", "scanner"] } } });
  if (result.count === 0) {
    throw createError({ statusCode: 404, message: "Staff or scanner account not found." });
  }
  setResponseStatus(event, 204);
  return null;
});
