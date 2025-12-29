import { defineMiddleware } from "astro/middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  // For now, we just pass the request through.
  // We handle routing via the [lang] folder structure.
  return next();
});