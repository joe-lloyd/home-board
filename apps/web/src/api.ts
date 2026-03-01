import { Chore, Todo, BoardEvent } from "@homeboard/types";

const API_URL = "/api"; // Proxied by Vite

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, options);
  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getChores: () => fetcher<Chore[]>("/chores"),
  completeChore: (id: string) =>
    fetcher<Chore>(`/chores/${id}/complete`, { method: "POST" }),

  getTodos: () => fetcher<Todo[]>("/todos"),
  toggleTodo: (id: string) =>
    fetcher<Todo>(`/todos/${id}/toggle`, { method: "POST" }),
  createTodo: (text: string) =>
    fetcher<Todo>("/admin/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }),
  deleteTodo: (id: string) =>
    fetcher<{ success: boolean }>(`/admin/todos/${id}`, { method: "DELETE" }),

  getEvents: () => fetcher<BoardEvent[]>("/events"),

  getWeather: (city: string) =>
    fetcher<{ tempC: string; condition: string; iconPath: string }>(
      `/weather/${encodeURIComponent(city)}`,
    ),

  // Admin
  createChore: (data: { name: string; intervalDays: number }) =>
    fetcher<Chore>("/admin/chores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updateChore: (id: string, data: { name?: string; intervalDays?: number }) =>
    fetcher<Chore>(`/admin/chores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deleteChore: (id: string) =>
    fetcher<{ success: boolean }>(`/admin/chores/${id}`, { method: "DELETE" }),

  getCalendars: () =>
    fetcher<{ id: string; name: string; icsUrl: string }[]>("/admin/calendars"),
  createCalendar: (data: { name: string; icsUrl: string }) =>
    fetcher<{ id: string }>("/admin/calendars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deleteCalendar: (id: string) =>
    fetcher<{ success: boolean }>(`/admin/calendars/${id}`, {
      method: "DELETE",
    }),
  refreshCalendars: () =>
    fetcher<{ success: boolean }>("/admin/calendars/refresh", {
      method: "POST",
    }),

  // System
  triggerUpdate: () =>
    fetcher<{ success: boolean; message: string }>("/system/update", {
      method: "POST",
    }),
};
