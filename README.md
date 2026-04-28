# EventLink — Backend

HTTP API for **EventLink**. EventLink is a two-sided marketplace: **creators** publish events with sponsorship tiers; **sponsors** discover events, send proposals, and negotiate in a deal room. This service owns persistence and business rules exposed to the frontend.

---

## Stack

- **Node.js** — JavaScript runtime for the server; this project uses ES modules and runs the app with `tsx` in development.
- **TypeScript** — Typed JavaScript for safer refactors and clearer contracts across routes, services, and Prisma usage.
- **Express** — Minimal HTTP framework: routing, JSON bodies, middleware (auth, errors), and mounting feature modules.
- **Prisma** — Schema-first ORM: `schema.prisma` defines models, migrations evolve the database, and the generated client is used for queries.

---

## Project layout

```
eventlink-back/
├── prisma/
│   ├── schema.prisma    # Models: User, Event, DefaultTier, EventTier, Proposal, Conversation, Message
│   └── migrations/      # Created by prisma migrate
├── src/
│   ├── index.ts         # Entry: load env, listen on env.PORT
│   ├── core/            # App shell: Express factory, config, middleware, Prisma client
│   │   ├── server.ts
│   │   ├── config/
│   │   │   └── env.ts   # app config from process environment
│   │   ├── middleware/errorHandler.ts
│   │   └── prisma/
│   │       ├── client.ts
│   │       └── generated/   # prisma generate output (do not edit)
│   └── modules/         # Feature modules (e.g. routes, domain wiring); layout not enumerated here
├── prisma.config.ts     # Prisma CLI
└── package.json
```

Feature code under `src/modules/` should register routes (or other HTTP surfaces) from `createServer()` in `core/server.ts` (see comments there).

---

## Environment variables

Configuration is read from **`.env`** at the project root (see **`.env.example`** for a template). `dotenv` loads it when you run the app or Prisma CLI commands from this directory.

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP listen port; optional, defaults to `3000` (`src/core/config/env.ts`). |
| `NODE_ENV` | `development` or `production`; optional, defaults to `development` (`src/core/config/env.ts`). |
| `DATABASE_HOST` | Database server hostname or IP. |
| `DATABASE_PORT` | Database port; optional, defaults to `3306` if unset or invalid. |
| `DATABASE_USER` | Database user. |
| `DATABASE_PASSWORD` | Database password (may be empty). |
| `DATABASE_NAME` | Database/schema name. |

---

## Database migrations

Schema changes live in **`prisma/migrations/`**. Ensure the required database-related variables from the table above are set in **`.env`** (or the process environment) before any Prisma command or server start that touches the database.

### Development

Use these on your machine or any environment where it is safe to create migration files and let Prisma compare the live database to the schema.

- **`npx prisma migrate dev`** — applies pending migrations, regenerates the Prisma client, and detects drift against `schema.prisma`. Use this day to day while building features.
- **`npx prisma migrate dev --name <short-label>`** — same as above, but when `schema.prisma` has changed and there is no migration yet, Prisma writes a new SQL migration under `prisma/migrations/` (first run can bootstrap that folder).

Your DB user needs permission to create and alter tables.

### Production

In staging or production you only **apply** migrations that are already committed in the repo. Do **not** use `migrate dev` there: it can prompt, create new migration files, or reset state in ways that are unsafe on shared databases.

- **`npx prisma migrate deploy`** — runs every migration that has not been applied yet, then exits. Run this in CI/CD or on the server after deploy with the same environment configuration you use in production.

### Reset (development only)

- **`npx prisma migrate reset`** — **drops the database schema** (all data), reapplies every migration from scratch, and runs **`prisma generate`**. If you configure a seed script in `package.json`, Prisma runs it after migrations. Use this to get back to a clean slate locally; **never** point it at production data.

---

## Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Apply migrations and regenerate the Prisma client** — if there is no migration history yet for this checkout, use `npx prisma migrate dev --name <label>` once (for example `--name init`) so Prisma creates `prisma/migrations/` from `schema.prisma`.

   ```bash
   npx prisma migrate dev
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

The API listens on **`http://localhost:${PORT}`** (default port `3000`).

---

## Production

Configure production to use the same required environment values as in **`.env`** (including database variables) for `migrate deploy` and `npm start`.

1. **Build the compiled output**

   ```bash
   npm run build
   ```

2. **Apply pending migrations**

   ```bash
   npx prisma migrate deploy
   ```

3. **Start the server**

   ```bash
   npm start
   ```
