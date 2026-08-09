# Personal Work OS

Single-user Linear/Notion/Things-3-styled app for organizing work across multiple workspaces (companies, personal projects, etc.).

## Stack

- **client/** — React + Vite + TypeScript, Tailwind CSS v4, React Router, TanStack Query, dnd-kit (Kanban), react-markdown (Notes)
- **server/** — Express + TypeScript, Prisma ORM, SQLite

No authentication in v1 (single local user).

## Running locally

Two dev servers, run in separate terminals:

```bash
cd server
npm install        # first time only
npm run dev         # http://localhost:4000
```

```bash
cd client
npm install        # first time only
npm run dev         # http://localhost:5173 (proxies /api to :4000)
```

Open http://localhost:5173.

## Database

SQLite file at `server/prisma/dev.db`, managed by Prisma.

```bash
cd server
npx prisma migrate dev   # apply schema changes
npx prisma studio        # browse data in a GUI
```

## Project structure

```
personal-work-os/
  client/   Vite React app (pages, features, UI components)
  server/   Express API (routes per resource, Prisma schema)
```
