import { Hono } from "hono";

export const chatRoutes = new Hono();

chatRoutes.post("/chat/completions", async (c) => {
  const body = await c.req.json();

  // TODO: Implement scoring, logging, and forwarding
  return c.json({
    message: "Proxy endpoint ready",
    received: { model: body.model },
  });
});
