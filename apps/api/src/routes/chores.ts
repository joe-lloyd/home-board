import { FastifyInstance } from "fastify";
import { prisma } from "@homeboard/db";
import { Chore, ChoreStatus } from "@homeboard/types";
import dayjs from "dayjs";
import { broadcast } from "../sse";
import { z } from "zod";

const calculateChoreStatus = (
  lastCompletedAt: Date,
  intervalDays: number,
): Omit<Chore, "id" | "name" | "intervalDays" | "lastCompletedAt"> & {
  lastCompletedAt: Date;
} => {
  const lastCompleted = dayjs(lastCompletedAt);
  const nextDue = lastCompleted.add(intervalDays, "day");
  const now = dayjs();

  // Calculate days remaining (start of day to start of day comparison usually better, but floating point diff is fine for now)
  const daysRemaining = nextDue.diff(now, "day", true);

  let status: ChoreStatus = "ok";
  if (daysRemaining < 0) {
    status = "overdue";
  } else if (daysRemaining <= 3) {
    status = "soon";
  }

  return {
    lastCompletedAt: lastCompletedAt,
    nextDue: nextDue.toDate(),
    daysRemaining: Math.ceil(daysRemaining), // Round up for display
    status,
  };
};

export async function choreRoutes(server: FastifyInstance) {
  server.get("/chores", async () => {
    const chores = await prisma.chore.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return chores.map((chore) => ({
      ...chore,
      ...calculateChoreStatus(chore.lastCompletedAt, chore.intervalDays),
    }));
  });

  server.post<{ Params: { id: string } }>(
    "/chores/:id/complete",
    async (req, reply) => {
      const { id } = req.params;

      const updated = await prisma.chore.update({
        where: { id },
        data: {
          lastCompletedAt: new Date(),
        },
      });

      broadcast({ type: "invalidate", resource: "chores" });

      return updated;
    },
  );

  server.post<{ Body: { name: string; intervalDays: number } }>(
    "/admin/chores",
    async (req, reply) => {
      const { name, intervalDays } = req.body;

      const created = await prisma.chore.create({
        data: {
          name,
          intervalDays,
          lastCompletedAt: new Date(), // Assume done when created? Or require date? Spec doesn't say. Defaulting to now.
        },
      });

      broadcast({ type: "invalidate", resource: "chores" });
      return created;
    },
  );

  server.patch<{
    Params: { id: string };
    Body: { name?: string; intervalDays?: number };
  }>("/admin/chores/:id", async (req, reply) => {
    const { id } = req.params;
    const { name, intervalDays } = req.body;

    const updated = await prisma.chore.update({
      where: { id },
      data: {
        name,
        intervalDays,
      },
    });

    broadcast({ type: "invalidate", resource: "chores" });
    return updated;
  });

  server.delete<{ Params: { id: string } }>(
    "/admin/chores/:id",
    async (req, reply) => {
      const { id } = req.params;
      await prisma.chore.delete({ where: { id } });
      broadcast({ type: "invalidate", resource: "chores" });
      return { success: true };
    },
  );
}
