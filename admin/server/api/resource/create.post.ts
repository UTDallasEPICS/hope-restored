import { CreateResourceUseCase } from "~/server/usage/Resource/create";
import { defineEventHandler, readBody, createError } from "h3";
import { logActivityEvent } from "~/server/utils/activity-log";

export default defineEventHandler(async (event) => {
  const data = await readBody(event);
  if (!data.name || !data.description || !data.groupName) {
    throw createError({
      statusCode: 400,
      message: "Name, description, and groupName are required",
    });
  }
  const usage = new CreateResourceUseCase();

  try {
    const resource = await usage.execute(data);
    logActivityEvent(event, {
      summary: `Added resource "${data.name}" in group "${data.groupName}"`,
      details: [
        `Name: ${data.name}`,
        `Group: ${data.groupName}`,
      ],
    }).catch(() => {});
    return resource;
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error creating resource",
    });
  }
});
