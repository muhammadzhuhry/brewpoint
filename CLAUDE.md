# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current State

No application code exists yet — only planning docs in `docs/`. The project is pre-Phase-0: scaffolding has not been created.

Before writing any code, read (in this order): `docs/PRD.md` (what to build and why), `docs/TECH_SPEC.md` (schema, API contracts, layering), `docs/ROADMAP.md` (build phases and order), `docs/DESIGN_SYSTEM.md` (visual/component conventions). The build checklist lives in `TODO.md` — follow its Part 1 → 2 → 3 → 4 order.

No build/test tooling exists yet. Once `package.json` is present (inside `brewpoint/`), commands will be:

```bash
npm run dev          # dev server
npm run build        # production build
npm run lint         # ESLint
npx drizzle-kit generate   # generate migration SQL from schema changes
npx drizzle-kit migrate    # apply pending migrations
```

Update this section once those files exist.

## Stack (TECH_SPEC.md v2.0)

BrewPoint MVP is a **single Next.js app** (`brewpoint-web/`) — no separate backend service:

- **API layer:** Route Handlers (`app/api/v1/**/route.ts`) — structured as a REST API, not Server Actions. This keeps the frontend decoupled from the API so a Go backend can replace the Route Handlers later with one env-var change (`API_BASE_URL`).
- **ORM:** Drizzle ORM + `postgres.js` driver against PostgreSQL. No Prisma, no raw SQL.
- **Auth:** JWT in an `httpOnly` cookie, signed with `jose`.
- **UI:** Next.js App Router, shadcn/ui + Tailwind, Zustand (cart/UI state), TanStack Query (server state).
- **Money:** Postgres `NUMERIC(12,2)`, string-based decimal handling in TypeScript — never JS floats.

## Architecture

**Layering:** Route Handler → Service (`lib/services/`) → Drizzle query. Handlers only parse requests and shape responses; all business rules live in the service layer. A separate repository file per module is unnecessary at this scale — co-locate Drizzle queries in the service file until a module's query logic is complex enough to extract.

**Auth is two-layered by design:**

- `middleware.ts` — checks that a session cookie _exists_; cheap, runs on Edge, handles redirects.
- `requireAuth(req, role?)` in `lib/auth/session.ts` — verifies the JWT signature and role _inside each Route Handler_. Never rely on `middleware.ts` alone to protect an admin-only endpoint.

**Checkout atomicity (`lib/services/transaction-service.ts`):** the entire checkout must run inside `db.transaction()`. Each product row is locked with `.for("update")` (Drizzle's `SELECT ... FOR UPDATE`) before checking and deducting stock. Any failure (`INSUFFICIENT_STOCK`, underpayment) rolls back the entire transaction. Do not change this path without preserving the lock/rollback behavior — see `TECH_SPEC.md` §5 for the reference implementation.

**Soft deletes and snapshotting:** products use `is_active = false`, never hard-deleted (historical `transaction_items` must keep a valid FK). `transaction_items` snapshots `product_name_snapshot`/`unit_price_snapshot` at sale time — price edits must never alter past receipts. `stock_adjustments` is append-only (insert + read, no update/delete). Voided transactions are `status = 'voided'`, never deleted; voiding restores stock.

**API envelope:** all responses use `{"success": bool, "data": {...}}` or `{"success": false, "error": {"code": "...", "message": "..."}}`. Error codes (e.g. `INSUFFICIENT_STOCK`, `FORBIDDEN`) are defined in `lib/app-error.ts` and map to HTTP status once — handlers throw `AppError`, never set status codes directly.

**State split:** Zustand owns only client state (cart, UI toggles). All server-derived data (products, transactions, dashboard) goes through TanStack Query. Never duplicate server state into Zustand.

## Build Order

Follow `TODO.md` strictly: Part 1 (frontend with mock data) → Part 2 (Route Handlers + Drizzle, same app) → Part 3 (integration, replace mocks with real calls) → Part 4 (deploy). When asked to implement a feature, check its phase in `ROADMAP.md` and whether its prerequisites are satisfied.

<!-- rtk-instructions v2 -->

# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:

```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)

```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)

```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)

```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)

```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)

```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)

```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)

```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)

```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)

```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands

```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category         | Commands                       | Typical Savings |
| ---------------- | ------------------------------ | --------------- |
| Tests            | vitest, playwright, cargo test | 90-99%          |
| Build            | next, tsc, lint, prettier      | 70-87%          |
| Git              | status, log, diff, add, commit | 59-80%          |
| GitHub           | gh pr, gh run, gh issue        | 26-87%          |
| Package Managers | pnpm, npm, npx                 | 70-90%          |
| Files            | ls, read, grep, find           | 60-75%          |
| Infrastructure   | docker, kubectl                | 85%             |
| Network          | curl, wget                     | 65-70%          |

Overall average: **60-90% token reduction** on common development operations.

<!-- /rtk-instructions -->
