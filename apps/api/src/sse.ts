import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { SSEEvent } from "@homeboard/types";

const clients = new Set<FastifyReply>();

export function setupSSE(server: FastifyInstance) {
  server.get("/events/stream", (req: FastifyRequest, reply: FastifyReply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("Access-Control-Allow-Origin", "*");

    // Send initial ping
    reply.raw.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);

    clients.add(reply);

    req.raw.on("close", () => {
      clients.delete(reply);
    });
  });
}

export function broadcast(event: SSEEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of clients) {
    client.raw.write(data);
  }
}
