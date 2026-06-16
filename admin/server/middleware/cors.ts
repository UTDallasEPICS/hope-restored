import {
  createError,
  defineEventHandler,
  getRequestURL,
  setResponseHeaders,
} from "h3";

// This middleware sets the CORS headers for the response
// This allows the client to make requests to the server from a different origin
// Like a frontend application hosted on a different domain (i.e. the public view)
function isLocalDevOrigin(origin: string) {
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

export default defineEventHandler((event) => {
  const allowedOrigins = [`${import.meta.env.VITE_EXTERNAL_VIEWER_URL}`].filter(
    Boolean,
  );
  const origin = event.node.req.headers.origin;
  const requestOrigin = getRequestURL(event).origin;
  const isDevLanOrigin =
    process.env.NODE_ENV !== "production" &&
    !!origin &&
    isLocalDevOrigin(origin);
  const isAllowedOrigin =
    !!origin &&
    (allowedOrigins.includes(origin) ||
      origin === requestOrigin ||
      isDevLanOrigin);
  if (isAllowedOrigin) {
    setResponseHeaders(event, {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Expose-Headers": "Content-Length, X-Kuma-Revision",
    });
    return;
  }

  if (origin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Origin not allowed",
    });
  }
});
