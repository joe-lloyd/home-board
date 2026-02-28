Alright Joe 😄
Here’s the **full rewritten spec**, clean, production-minded, and now including **real-time sync via SSE**.

This is written so you can drop it straight into your AI IDE and scaffold the whole thing properly.

---

# 🧠 Project Name

**HomeBoard**
Self-hosted household dashboard for wall-mounted tablets.

---

# 🎯 Goals

* Fully web-based
* Runs on Raspberry Pi
* Deployable via Docker Compose
* Works with existing Portainer setup
* No authentication (LAN only)
* Modern animated UI
* Multi-tablet real-time sync
* Aggregated read-only calendars (ICS)
* Recurring chore engine with countdown logic
* Big visual todo list
* Simple admin backend

---

# 🏗 Architecture Overview

Monorepo managed with **Turborepo**.

```
homeboard/
  apps/
    api/        → Fastify backend (REST + SSE)
    web/        → React frontend (dashboard + admin)
  packages/
    db/         → Prisma + SQLite schema
    types/      → Shared TypeScript types
  docker/
    Dockerfile
    docker-compose.yml
  turbo.json
  pnpm-workspace.yaml
```

---

# 🧰 Tech Stack

## Monorepo

* Turborepo
* PNPM workspaces

## Backend

* Node 20
* Fastify
* Prisma ORM
* SQLite
* node-cron
* ical.js
* Zod
* Native EventSource (SSE)

## Frontend

* React
* Vite
* TypeScript
* TanStack Query
* Framer Motion
* TailwindCSS
* Day.js

## Infrastructure

* Docker
* Docker Compose
* Portainer deployment

---

# 🗃 Database Layer

SQLite database stored in mounted Docker volume.

## Prisma Schema

```prisma
model Chore {
  id               String   @id @default(cuid())
  name             String
  intervalDays     Int
  lastCompletedAt  DateTime
  createdAt        DateTime @default(now())
}

model Todo {
  id         String   @id @default(cuid())
  text       String
  completed  Boolean  @default(false)
  dueDate    DateTime?
  createdAt  DateTime @default(now())
}

model Calendar {
  id       String @id @default(cuid())
  name     String
  icsUrl   String
}

model Event {
  id          String   @id @default(cuid())
  calendarId  String
  title       String
  start       DateTime
  end         DateTime

  calendar    Calendar @relation(fields: [calendarId], references: [id], onDelete: Cascade)
}
```

Database file path:

```
/app/data/homeboard.db
```

---

# 🧹 Recurring Chore Engine

No cron-based resets.

Chores are computed dynamically.

### Computed Fields Returned by API

```ts
{
  id,
  name,
  intervalDays,
  lastCompletedAt,
  nextDue,
  daysRemaining,
  status // "ok" | "soon" | "overdue"
}
```

### Status Logic

```
daysRemaining > 3 → ok
0 <= daysRemaining <= 3 → soon
daysRemaining < 0 → overdue
```

Completing a chore:

* Update `lastCompletedAt`
* Broadcast real-time update

---

# 📅 Calendar Sync System

## Flow

1. Store ICS URLs in DB.
2. Cron runs every `CALENDAR_REFRESH_MINUTES`.
3. Fetch ICS feeds.
4. Parse using `ical.js`.
5. Replace events for next `EVENT_LOOKAHEAD_DAYS`.

Only store:

* Today
* +60 days (configurable)

Avoids DB bloat.

---

# ⚡ Real-Time Sync (SSE)

## Why SSE Instead of WebSockets?

* One-way updates only
* Simpler than WS
* Perfect for LAN multi-tablet setup
* No stateful socket management
* Auto reconnect built-in

---

## Backend SSE Implementation

### Endpoint

```
GET /events/stream
```

Headers:

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### Server Behavior

* Maintain in-memory set of connected clients.
* On:

  * Todo toggle
  * Chore completion
  * Calendar refresh
* Broadcast:

```json
{
  "type": "invalidate"
}
```

If container restarts:

* Clients auto-reconnect.

No Redis.
No message broker.
LAN only.

---

## Frontend SSE Integration

On app mount:

```ts
useEffect(() => {
  const source = new EventSource("/events/stream");

  source.onmessage = () => {
    queryClient.invalidateQueries();
  };

  return () => source.close();
}, []);
```

TanStack Query handles refetching.

All tablets sync instantly.

---

# 🖥 API Structure

## Dashboard Routes

```
GET  /dashboard
GET  /todos
POST /todos/:id/toggle
GET  /chores
POST /chores/:id/complete
GET  /events
```

## Admin Routes

```
POST   /admin/todos
DELETE /admin/todos/:id

POST   /admin/chores
PATCH  /admin/chores/:id
DELETE /admin/chores/:id

POST   /admin/calendars
DELETE /admin/calendars/:id
POST   /admin/calendars/refresh
```

No authentication.
Server accessible on LAN only.

---

# 🎨 Frontend Specification

## Routes

```
/        → Dashboard mode (wall display)
/admin   → Admin management panel
```

---

# 📺 Dashboard Layout

```
-------------------------------------------------
|               Month Calendar                  |
-------------------------------------------------
|  Today’s Events     |    Active Chores        |
-------------------------------------------------
|              Big Todo List                    |
-------------------------------------------------
```

### Design Requirements

* Large tap targets
* High contrast
* Responsive for tablet landscape
* Smooth animations
* Minimal visual noise
* Modern but calm aesthetic

---

# ✨ Animation Guidelines

Use Framer Motion for:

* Todo completion bounce
* Chore color transitions
* Soft fade-in on load
* Subtle slide transitions

Constraints:

* < 250ms transitions
* Ease-in-out
* No excessive motion
* Smooth but not distracting

---

# 🎛 Admin Panel

Simple tabbed layout:

Tabs:

* Todos
* Chores
* Calendars

Forms allow:

* Create/edit chores (intervalDays)
* Add ICS URLs
* Force calendar refresh
* Manage todos

No auth layer.
Intended for trusted LAN use.

---

# 🔁 Background Jobs

## Cron Jobs

### Calendar Refresh

Runs every:

```
CALENDAR_REFRESH_MINUTES=10
```

### Optional Cleanup

Daily at midnight:

* Delete events older than today.

---

# 🧱 Turborepo Config

`turbo.json`

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false
    }
  }
}
```

---

# 🐳 Docker Setup

## Dockerfile (root)

```Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

EXPOSE 3000

CMD ["node", "apps/api/dist/index.js"]
```

---

## docker-compose.yml

```yaml
version: "3.9"

services:
  homeboard:
    container_name: homeboard
    build: .
    ports:
      - "3005:3000"
    volumes:
      - homeboard_data:/app/data
    restart: unless-stopped

volumes:
  homeboard_data:
```

Deployable via Portainer Git stack.

Single-click redeploy.

---

# 📦 Environment Variables

```
DATABASE_URL="file:./data/homeboard.db"
CALENDAR_REFRESH_MINUTES=10
EVENT_LOOKAHEAD_DAYS=60
NODE_ENV=production
```

---

# 🔐 Security Model

Assumptions:

* Only accessible on local network
* No external exposure
* No authentication
* If exposed publicly → must add auth layer

---

# 🧪 Testing Strategy

Backend:

* Vitest
* Test chore countdown logic
* Test ICS parsing
* Test SSE broadcast behavior

Frontend:

* Component tests
* Verify chore status rendering
* Verify SSE invalidation triggers refetch

---

# 📈 Future-Proofing

Design for:

* Assign chores to specific person
* Stats dashboard
* Streak tracking
* PWA support
* Offline mode
* Dark/light theme auto switch
* Touch gestures
* Role-based auth (if ever exposed)

---

# 🧠 Core Design Principles

* Computed state > reset logic
* SQLite for simplicity
* Single-container deployment
* Real-time via SSE, not polling
* Type-safe end-to-end
* No unnecessary infrastructure
* Easy backup (single DB file)

---

This now gives you:

✔ Modern animated UI
✔ Multi-tablet instant sync
✔ Clean architecture
✔ Simple deployment
✔ No overengineering
