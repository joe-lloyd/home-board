import { FastifyInstance } from "fastify";
import { prisma } from "@homeboard/db";
import { syncAllCalendars } from "../services/calendar";
import { broadcast } from "../sse";
import dayjs from "dayjs";

export async function calendarRoutes(server: FastifyInstance) {
  server.get("/events", async () => {
    // Return events from now until lookahead
    const now = dayjs();
    const end = now.add(Number(process.env.EVENT_LOOKAHEAD_DAYS) || 60, "day");

    return prisma.event.findMany({
      where: {
        start: {
          gte: now.startOf("day").toDate(),
          lte: end.toDate(),
        },
      },
      include: {
        calendar: true,
      },
      orderBy: {
        start: "asc",
      },
    });
  });

  server.get("/admin/calendars", async () => {
    return prisma.calendar.findMany();
  });

  server.post<{ Body: { name: string; icsUrl: string } }>(
    "/admin/calendars",
    async (req, reply) => {
      const { name, icsUrl } = req.body;

      // Validate URL?
      try {
        new URL(icsUrl);
      } catch {
        return reply.code(400).send({ error: "Invalid URL" });
      }

      const created = await prisma.calendar.create({
        data: {
          name,
          icsUrl,
        },
      });

      // Trigger sync immediately in background
      syncAllCalendars().catch(console.error);

      return created;
    },
  );

  server.delete<{ Params: { id: string } }>(
    "/admin/calendars/:id",
    async (req, reply) => {
      const { id } = req.params;
      await prisma.calendar.delete({ where: { id } });
      broadcast({ type: "invalidate", resource: "events" });
      return { success: true };
    },
  );

  server.post("/admin/calendars/refresh", async (req, reply) => {
    // Trigger sync
    syncAllCalendars().catch(console.error);
    return { success: true, message: "Sync started" };
  });
}
