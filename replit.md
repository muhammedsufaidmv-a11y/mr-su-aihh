# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (backend), Firebase Firestore (Mr.Su AI app)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Mr.Su AI (`artifacts/mrsu-ai`) — at `/`
AI-powered digital marketing command center.
- **Auth**: Firebase Google Auth (`src/lib/auth-context.tsx`)
- **DB**: Firebase Firestore (`src/lib/firebase.ts`)
- **AI**: Google Gemini 2.0 Flash via `@google/genai` (`src/lib/gemini.ts`)
- **Pages**: Dashboard, Strategy, Content, Leads, Tasks, Chat, AI Tools
- **Required env**: `GEMINI_API_KEY` (secret)
- Firebase config in `src/lib/firebase.ts` (project: `project-a11082d1-41a4-41fd-9db`)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mrsu-ai/            # Mr.Su AI React app (Firebase + Gemini)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

Root commands:
- `pnpm run typecheck:libs` runs `tsc --build` for the composite libs.
- `pnpm run typecheck` — full check across all packages.

## Packages

### `artifacts/mrsu-ai` (`@workspace/mrsu-ai`)
React + Vite + Firebase + Gemini AI marketing app.
- Runs on port from `PORT` env var
- Uses Firebase for auth and Firestore data storage
- Gemini API key injected via `VITE_GEMINI_API_KEY` in vite.config.ts
- All user data stored per-user in Firestore: `/users/{uid}/...`

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for validation and `@workspace/db` for persistence.

### `lib/db` (`@workspace/db`)
Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)
Owns the OpenAPI 3.1 spec and the Orval config.

### `lib/api-zod` (`@workspace/api-zod`)
Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)
Generated React Query hooks and fetch client from the OpenAPI spec.
