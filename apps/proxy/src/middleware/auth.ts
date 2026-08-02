import { Context, Next } from "hono";

export const authMiddleware = async (c: Context, next: Next) => {
  const apiKey = c.req.header("Authorization");

  if (!apiKey) {
    return c.json({ error: "Missing API key" }, 401);
  }

  // TODO: Validate API key against database
  await next();
};
