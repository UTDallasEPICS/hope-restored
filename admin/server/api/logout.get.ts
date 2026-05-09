import { toWebRequest } from "h3";
import { auth } from "~/lib/auth";

export default defineEventHandler(async (event) => {
  await auth.api.signOut({
    headers: toWebRequest(event).headers,
  });

  return { success: true };
});
