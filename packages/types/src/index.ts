import { z } from "zod";

export const ChoreStatusSchema = z.enum(["ok", "soon", "overdue"]);
export type ChoreStatus = z.infer<typeof ChoreStatusSchema>;

export const ChoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  intervalDays: z.number(),
  lastCompletedAt: z.date(),
  nextDue: z.date(),
  daysRemaining: z.number(),
  status: ChoreStatusSchema,
});
export type Chore = z.infer<typeof ChoreSchema>;

export const TodoSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
  dueDate: z.date().optional().nullable(),
  createdAt: z.date(),
});
export type Todo = z.infer<typeof TodoSchema>;

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.string(), // ISO string from backend
  end: z.string(), // ISO string from backend
  calendarName: z.string().optional(),
});
export type BoardEvent = z.infer<typeof EventSchema>;

export type SSEEvent =
  | { type: "invalidate"; resource: "all" | "chores" | "todos" | "events" }
  | { type: "ping" };
