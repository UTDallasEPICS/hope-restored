import { ArchiveResourceUseCase } from "~/server/usage/Resource/archive";
import { FindOneResourceUseCase } from "~/server/usage/Resource/findOne";
import { defineEventHandler, createError } from "h3";
import { logActivityEvent } from "~/server/utils/activity-log";

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: "Invalid resource ID",
    });
  }

  const findUsage = new FindOneResourceUseCase();
  const existing = await findUsage.execute(id).catch(() => null);

  const usage = new ArchiveResourceUseCase();

  try {
    await usage.execute(Number(id));
    logActivityEvent(event, {
      summary: existing ? `Removed resource "${existing.name}"` : `Removed resource #${id}`,
      details: existing
        ? [`Name: ${existing.name}`, `Group: ${(existing as any).groupName ?? "N/A"}`]
        : [`ID: ${id}`],
    }).catch(() => {});
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error deleting resource",
    });
  }
});
