# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Oksskolten?

An AI-native RSS reader that fetches full article text by default. Every article is extracted via Readability + 500 noise-removal patterns, converted to Markdown, and stored locally. AI summarization, translation, and chat work on complete text, not RSS excerpts.

See `README.md` for project overview and `docs/spec/` for detailed specs.

## Commands

```bash
# Development
docker compose up --build         # Full stack with HMR (frontend :5173, backend :3000)
npm run dev                       # Frontend only (Vite dev server)
npm run dev:server                # Backend only (tsx watch)
npm run dev:server:noauth         # Backend without auth (AUTH_DISABLED=1)

# Quality checks (run before pushing — CI enforces all three)
npm run typecheck                 # tsc --noEmit (strict, noUnusedLocals/Parameters)
npm run lint                      # ESLint across src/ server/ shared/
npm run test                      # Vitest (all projects)

# Run tests by project
npx vitest run --project server   # Server tests only
npx vitest run --project client   # Client tests only

# Run a single test file
npx vitest run path/to/file.test.ts

# Watch mode
npm run test:watch

# Build
npm run build                     # Production Vite build
make ci                           # Full CI: typecheck + lint + test + demo build

# Production (Docker + Cloudflare Tunnel)
make prod                         # Start production
make prod-down                    # Stop production
make prod-restart                 # Rebuild + restart with minimal downtime
```

## Architecture

Single Node.js 22 process running Fastify API, Vite SPA, and cron scheduler in one container.

```
server/           Fastify backend
  routes/           API route handlers
  db/               SQLite (libsql, WAL mode) data layer
  fetcher/          RSS fetch → Readability → clean → Markdown pipeline
  chat/             MCP-powered AI chat (multi-turn, tool use)
  search/           Meilisearch integration
  providers/        Auth (JWT, Passkey/WebAuthn, GitHub OAuth)
  lib/              Server utilities

src/              React 19 + Vite SPA
  components/       UI components (shadcn/ui + Radix primitives)
  hooks/            Custom React hooks (65+ modules)
  pages/            Page components
  lib/              Client utilities, fetcher, i18n, demo mode
  data/             Static data (themes, AI models, fonts)

shared/           Shared between server and client
  models.ts         Zod schemas and types
  types.ts          Type definitions
  lang.ts           Language utilities
  url.ts            URL helpers

migrations/       SQLite schema migrations (run at startup)
docs/spec/        Feature specifications
docs/adr/         Architecture Decision Records
```

**Testing setup (vitest.config.ts):** Two projects — `server` (Node.js env, in-memory SQLite `:memory:`, AUTH_DISABLED=1) and `client` (jsdom env, max 2 threads, Istanbul coverage). Server tests use `server/__tests__/helpers/testDb.ts` and `buildApp.ts`. Client tests use `@testing-library/react`.

**Cron jobs:** Feed fetch (5 min), score recalculation (5 min), search index rebuild (6 hours), retention cleanup (4 AM daily). All configurable via env vars.

## Database

SQLite (libsql, WAL mode) at `./data/rss.db`.

- **Reads:** `sqlite3 ./data/rss.db` works fine while the server is running (WAL allows concurrent readers).
- **Writes:** Direct sqlite3 CLI writes do not work while the server is running. WAL mode causes the server process to hold the DB connection, so external writes are silently lost. Use API endpoints instead, or add a temporary admin endpoint in `server/routes/admin.ts` for one-off data injection.
- **API keys:** Create from Settings → Security → API Tokens. Use `read,write` scope for mutation endpoints. Example: `curl -H "Authorization: Bearer ok_..." http://localhost:3000/api/...`
- **Soft delete:** Articles use `purged_at` column. Always use `FROM active_articles` VIEW for SELECT queries — never write `purged_at IS NULL` in application code. The base `articles` table is only for INSERT/UPDATE/DELETE and dedup/retention operations. See `docs/adr/002-retention-soft-delete.md`.

## Key Conventions

**Settings sync:** Frontend `hydrationMap` (`src/hooks/use-settings.ts`) must match server `PREF_KEYS` (`server/routes/settings.ts`). Adding a key to `hydrationMap` without `PREF_KEYS` causes 400 errors on page load.

**Theme system:** 14 themes × light/dark. Colors defined in `src/data/themes.ts`, applied as CSS custom properties. Never use raw colors (`text-gray-500`, `bg-white`) — always theme tokens (`text-text`, `bg-bg-card`, `border-border`, `text-accent`). `resolveColors()` auto-fills optional tokens; only override when intentionally different.

**Z-index scale:** z-30 header → z-50 tooltip/dropdown → z-70 dialog → z-90 chat → z-100 lightbox. All floating elements portal to `<body>`; fix stacking in base UI components (`src/components/ui/`), not call sites.

**i18n:** Source code in English. User-visible text goes in `src/lib/i18n.ts` dictionary, referenced via `t()`. Demo mode uses `src/lib/demo/i18n.ts` with `dt()`. Non-English text is only allowed in files listed in `.claude/rules/language.md`.

**Demo mode (3-layer):** `fetcher.demo.ts` (adapter) → `mock-api.ts` (router) → `demo-store.ts` (in-memory DB). Business logic lives in `demo-store.ts` only. Use `createFeed()`/`createArticle()` factories, never object literals.

**Dev seed:** On first startup with empty DB, demo data loads from `src/lib/demo/seed/*.json`. Idempotent, skipped if feeds exist. `NO_SEED=1` to start empty.

**Releases:** tagpr auto-creates release PRs. Version bump determined by PR labels: `kind/feature` → minor, `kind/breaking-change` → major, else patch. See `.claude/rules/release.md`.

## Language

- **Chat:** Respond in the same language the user speaks.
- **Issues, PRs, and commit messages:** Always use English.
