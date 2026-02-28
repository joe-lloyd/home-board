import { prisma } from "@homeboard/db";
import ical from "ical.js"; // Check import style for ical.js
import dayjs from "dayjs";
import { broadcast } from "../sse";

// Ical.js types are a bit loose sometimes, usually 'ical.js' default export works.

export async function syncCalendar(calendarId: string) {
  const calendar = await prisma.calendar.findUnique({
    where: { id: calendarId },
  });
  if (!calendar) return;

  try {
    const response = await fetch(calendar.icsUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch ICS: ${response.statusText}`);
    const icsData = await response.text();

    const jcalData = ical.parse(icsData);
    const comp = new ical.Component(jcalData);
    const vevents = comp.getAllSubcomponents("vevent");

    const now = dayjs();
    const lookahead = Number(process.env.EVENT_LOOKAHEAD_DAYS) || 60;
    const endLimit = now.add(lookahead, "day");

    const eventsToSave = [];

    for (const vevent of vevents) {
      const event = new ical.Event(vevent);

      // Handle recurrence? ical.js has an iterator.
      // For simplicity in this iteration, we might just look at start/end if not recurring,
      // or expand if recurring.
      // ical.js iterator example:

      if (event.isRecurring()) {
        const iterator = event.iterator();
        let next = iterator.next();
        while (next) {
          const start = dayjs(next.toString()); // checks ical.Time to string
          if (start.isAfter(endLimit)) break;

          if (start.isSame(now, "day") || start.isAfter(now)) {
            const duration = event.duration;
            const end = start.add(duration.toSeconds(), "second"); // approximate if duration known

            // event.iterator returns ical.Time which has jsDate.
            const startDate = next.toJSDate();

            // For end date, we need to calculate based on duration if not available on 'next' directly
            // ical.js recurrence expansion is a bit manual.
            // Let's rely on `next` being the start time.

            // A simpler approach for the MVP if recurrence is complex:
            // Just grab what we can. ical.js is good but verbose.

            eventsToSave.push({
              title: event.summary,
              start: startDate,
              end: dayjs(startDate)
                .add(event.duration.toSeconds(), "second")
                .toDate(), // simplified
              calendarId: calendar.id,
            });
          }
          next = iterator.next();
        }
      } else {
        const start = dayjs(event.startDate.toJSDate());
        if (
          start.isSame(now, "day") ||
          (start.isAfter(now) && start.isBefore(endLimit))
        ) {
          eventsToSave.push({
            title: event.summary,
            start: start.toDate(),
            end: event.endDate.toJSDate(),
            calendarId: calendar.id,
          });
        }
      }
    }

    // Transaction: Delete future events for this calendar, Insert new ones
    await prisma.$transaction([
      prisma.event.deleteMany({
        where: {
          calendarId: calendar.id,
          start: {
            gte: now.startOf("day").toDate(),
          },
        },
      }),
      prisma.event.createMany({
        data: eventsToSave,
      }),
    ]);

    console.log(
      `Synced calendar ${calendar.name}: ${eventsToSave.length} events.`,
    );
  } catch (error) {
    console.error(`Error syncing calendar ${calendar.name}:`, error);
  }
}

export async function syncAllCalendars() {
  const calendars = await prisma.calendar.findMany();
  for (const cal of calendars) {
    await syncCalendar(cal.id);
  }
  broadcast({ type: "invalidate", resource: "events" });
}
