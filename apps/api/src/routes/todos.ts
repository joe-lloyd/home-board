import { FastifyInstance } from "fastify";
import { prisma } from "@homeboard/db";
import { broadcast } from "../sse";
import { z } from "zod";

export async function todoRoutes(server: FastifyInstance) {
  server.get("/todos", async () => {
    return prisma.todo.findMany({
      orderBy: {
        createdAt: "desc", // Newest first default? Spec says "Big visual todo list".
      },
    });
  });

  server.post<{ Params: { id: string } }>(
    "/todos/:id/toggle",
    async (req, reply) => {
      const { id } = req.params;

      // Get current status first? Or just invert?
      // Prisma doesn't support "toggle" in one query easily without raw SQL usually, so fetch first is fine or update based on input.
      // Let's assume fetch first to toggle.
      const todo = await prisma.todo.findUnique({ where: { id } });
      if (!todo) return reply.code(404).send();

      const updated = await prisma.todo.update({
        where: { id },
        data: {
          completed: !todo.completed,
        },
      });

      broadcast({ type: "invalidate", resource: "todos" });
      return updated;
    },
  );

  server.post<{ Body: { text: string } }>(
    "/admin/todos",
    async (req, reply) => {
      const { text } = req.body;

      const created = await prisma.todo.create({
        data: {
          text,
          completed: false,
        },
      });

      broadcast({ type: "invalidate", resource: "todos" });
      return created;
    },
  );

  server.delete<{ Params: { id: string } }>(
    "/admin/todos/:id",
    async (req, reply) => {
      const { id } = req.params;
      await prisma.todo.delete({ where: { id } });
      broadcast({ type: "invalidate", resource: "todos" });
      return { success: true };
    },
  );
}
