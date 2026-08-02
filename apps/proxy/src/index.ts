import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { chatRoutes } from "./routes/chat";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.route("/v1", chatRoutes);

app.get("/health", (c) => c.json({ status: "ok" }));

const port = 3001;
console.log(`TokenSense proxy running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
