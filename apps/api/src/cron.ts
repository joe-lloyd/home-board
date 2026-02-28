import cron from "node-cron";
import { syncAllCalendars } from "./services/calendar";

export function setupCron() {
  const refreshMinutes = process.env.CALENDAR_REFRESH_MINUTES || "10";

  // Schedule sync
  cron.schedule(`*/${refreshMinutes} * * * *`, async () => {
    console.log("Running scheduled calendar sync...");
    await syncAllCalendars();
  });

  console.log(`Cron setup: Calendar sync every ${refreshMinutes} minutes.`);
}
