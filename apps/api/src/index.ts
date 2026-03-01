import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "@homeboard/db";
import { setupSSE } from "./sse";
import { choreRoutes } from "./routes/chores";
import { todoRoutes } from "./routes/todos";
import { calendarRoutes } from "./routes/calendar";
import { setupCron } from "./cron";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = Fastify({
  logger: true,
});

// Setup Cron
setupCron();

const start = async () => {
  try {
    await server.register(cors, {
      origin: "*",
    });

    setupSSE(server);
    await server.register(choreRoutes, { prefix: "/api" });
    await server.register(todoRoutes, { prefix: "/api" });
    await server.register(calendarRoutes, { prefix: "/api" });

    // Import dynamically to avoid top-level await issues if any
    const { systemRoutes } = await import("./routes/system");
    await server.register(systemRoutes, { prefix: "/api" });

    // Serve static files from web app
    await server.register(fastifyStatic, {
      root: path.join(__dirname, "../../web/dist"),
      prefix: "/",
    });

    server.setNotFoundHandler((req, reply) => {
      // SPA fallback
      if (req.raw.url && !req.raw.url.startsWith("/api")) {
        return reply.sendFile("index.html");
      }
      reply.code(404).send({ error: "Not found" });
    });

    await server.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
