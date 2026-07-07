# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current State

This repository currently contains **no application code** — only planning docs (`docs/`, duplicated under `brewpoint-api/docs/` and `brewpoint-web/docs/`). The project is at the pre-Phase-0 stage of `ROADMAP.md`: repo layout, database, and app scaffolding have not been created yet.

Before writing code, read (in this order): `docs/PRD.md` (what to build and why), `docs/TECH_SPEC.md` (how it's built — schema, API contracts, layering), `docs/ROADMAP.md` (build order/phases), `docs/DESIGN_SYSTEM.md` (frontend visual/component conventions). All four files are identical across `docs/`, `brewpoint-api/docs/`, and `brewpoint-web/docs/` — treat the root `docs/` copy as canonical and keep the others in sync if edited.

There is no build, lint, or test tooling yet. Once code is scaffolded per `TECH_SPEC.md` §2 and §9–10, commands should follow that spec's stack (Go Fiber backend with `go build`/`go test`, Next.js frontend with `npm run dev`/`build`/`lint`) — update this section with real commands as soon as `go.mod`/`package.json` exist.

## Project Summary

BrewPoint is a single-outlet coffee shop POS (point of sale) web app for internal staff only (admin + cashier roles) — no customer-facing surface. Core loop: cashier builds a cart from the product catalog, checks out with cash payment, stock is deducted atomically; admin manages products/categories/staff and reviews a sales dashboard.

**Planned stack** (from `TECH_SPEC.md`):
- Backend: Go Fiber REST API (`brewpoint-api/`), GORM against PostgreSQL, layered `Handler → Service → Repository`.
- Frontend: Next.js App Router (`brewpoint-web/`), shadcn/ui + Tailwind, Zustand (cart/UI state), TanStack Query (server state).
- Auth: JWT in an `httpOnly` cookie, verified by Fiber middleware; two roles (`admin`, `cashier`) enforced both server- and client-side.
- Money: Postgres `NUMERIC` + Go `decimal.Decimal` — never floats.

## Architecture Notes (for when code lands)

**Layering discipline (backend):** Handlers only parse requests/shape responses; business rules (e.g. "checkout is atomic," "can't deactivate the last admin") live in the Service layer so they're testable without HTTP or a real DB; Repositories isolate all GORM/DB access. When adding a feature, follow the existing module pattern per domain folder (`handler.go`, `service.go`, `repository.go`, `model.go`) — see `TECH_SPEC.md` §2.1 for the full planned tree (`auth`, `user`, `category`, `product`, `transaction`, `stockadjustment`, `dashboard`).

**Checkout is the most correctness-sensitive path in the system.** It must run inside a single DB transaction, lock each product row with `SELECT ... FOR UPDATE` (`clause.Locking{Strength: "UPDATE"}` in GORM) before checking/deducting stock, and roll back entirely on any failure (insufficient stock, invalid payment amount). See `TECH_SPEC.md` §5 for the reference implementation — any change to checkout or void logic must preserve this atomicity/locking behavior.

**Soft deletes and snapshotting exist for audit integrity, not convenience.** Products are never hard-deleted (`is_active = false`) because `transaction_items.product_id` must stay valid for historical transactions. `transaction_items` snapshots `product_name_snapshot`/`unit_price_snapshot` at sale time so later product edits never retroactively alter past receipts. Voided transactions are marked `status = 'voided'`, never deleted, and voiding restores stock. `stock_adjustments` is append-only (insert + read only, no update/delete) and is intentionally kept separate from sales-driven stock deductions so the two are distinguishable in audit history.

**Role enforcement is duplicated by design:** every admin-only action must be blocked both by backend middleware (`RequireRole`) and by frontend route/UI gating (`middleware.ts`, route groups) — see `TECH_SPEC.md` §7 and `PRD.md` Feature 2 acceptance criteria. Don't rely on frontend gating alone.

**API responses** always use the envelope `{"success": bool, "data" | "error": {...}}`; errors carry a machine-readable `code` (e.g. `INSUFFICIENT_STOCK`) via typed errors in `pkg/apperror`, mapped once to HTTP status — handlers should never set status codes ad hoc (`TECH_SPEC.md` §8).

**Frontend state split:** Zustand owns only local/client state (cart contents, UI toggles); everything server-derived (products, transactions, dashboard data) goes through TanStack Query. Don't duplicate server data into Zustand.

## Roadmap Awareness

`ROADMAP.md` defines a strict build order (Phase 0 foundation → Auth/Users → Category/Product → POS/Checkout → Transaction History/Stock Adjustment → Dashboard → v1.0 MVP → v1.1 performance/caching/rate-limiting → v1.2 reporting/realtime → v1.3 testing/CI). When asked to implement a feature, check which phase it belongs to and whether its stated prerequisites (per `PRD.md`'s "Dependencies" field on each feature) are already in place before building on top of them.

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

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->