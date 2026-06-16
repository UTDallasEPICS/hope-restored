import { UpdateResourceUseCase } from "~/server/usage/Resource/update";
import { defineEventHandler, readBody, createError } from "h3";
import { logActivityEvent } from "~/server/utils/activity-log";

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid resource ID",
    });
  }

  const data = await readBody(event);
  data.id = id;
  if (Object.keys(data).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "At least one field is required for update",
    });
  }

  const usage = new UpdateResourceUseCase();
  try {
    const updatedResource = await usage.execute(data);
    if (!updatedResource) {
      throw createError({
        statusCode: 404,
        statusMessage: "Resource not found",
      });
    }
    const changedFields = Object.keys(data).filter((k) => k !== "id");
    logActivityEvent(event, {
      summary: `Updated resource #${id}`,
      details: changedFields.map((k) => `${k}: ${String(data[k]).slice(0, 80)}`),
    }).catch(() => {});
    return updatedResource;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error updating resource",
    });
  }
});
