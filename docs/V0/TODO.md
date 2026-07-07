# BrewPoint — MVP Build Checklist (Frontend-First)

**Purpose:** a step-by-step, checkable to-do list covering the entire MVP end-to-end. Use this as your personal reference while building — check items off as you go.

**Order:** Frontend first (builds a working UI template with mock data) → Backend (real API + database) → Integration (wire them together) → Launch.

This intentionally differs from `ROADMAP.md`'s build order (which is backend-first, phase-by-phase). Both cover the same MVP scope — this document is organized by *what you touch first* (frontend template, then backend, then integration), which is better suited to how you said you want to learn. Refer back to `PRD.md` for feature detail, `TECH_SPEC.md` for schema/API contracts, and `DESIGN_SYSTEM.md` for exact tokens.

---

## Part 1 — Frontend (UI Template, Mock Data)

Goal of this part: a fully clickable Next.js app with every screen built, using fake/hardcoded data — no backend exists yet. This becomes your visual template and forces you to think through every UI state before wiring real data in.

### 1.1 Project Setup

- [ ] `create-next-app` with TypeScript, App Router, Tailwind CSS
- [ ] Install and init shadcn/ui (`npx shadcn init`)
- [ ] Set up folder structure per `TECH_SPEC.md` Section 2.2 (`app/`, `components/`, `lib/`, `stores/`, `hooks/`)
- [ ] Install fonts: Poppins + Inter via `next/font/google` (`app/fonts.ts`)
- [ ] Wire `--font-display` (Poppins) and `--font-body` (Inter) into `tailwind.config.ts`
- [ ] Paste `DESIGN_SYSTEM.md` Section 2.5 CSS variables into `app/globals.css`
- [ ] Add `--success`/`--warning` custom tokens on top of shadcn's default theme variables
- [ ] Verify base layout renders with the correct fonts and background color before building anything else

### 1.2 Atomic / Reusable Components

Install shadcn primitives first, then build BrewPoint-specific compositions on top:

- [ ] `npx shadcn add button` — verify `primary`/`secondary`/`outline`/`destructive`/`ghost` variants match `DESIGN_SYSTEM.md` 6.1
- [ ] `npx shadcn add input`, `label`, `textarea`
- [ ] `npx shadcn add select`, `dropdown-menu`
- [ ] `npx shadcn add dialog` (modals), `sheet` (side drawers)
- [ ] `npx shadcn add table`
- [ ] `npx shadcn add card`
- [ ] `npx shadcn add badge` — theme it for status tags (completed/voided/low-stock/out-of-stock/active/inactive) per 6.3
- [ ] `npx shadcn add form` (pairs with `react-hook-form` + `zod`)
- [ ] `npx shadcn add tabs` — for category filter chips on POS screen
- [ ] `npx shadcn add skeleton` — loading states
- [ ] `npx shadcn add sonner` or `toast` — success/error notifications
- [ ] Build custom `<ProductTile />` — used in POS grid, `radius-xl`, touch-friendly
- [ ] Build custom `<StatusBadge status="..." />` — wraps `Badge`, maps status string → correct color per 6.3
- [ ] Build custom `<NumericValue />` — wraps text with `tabular-nums`, used for all prices/stock counts
- [ ] Build custom `<EmptyState title icon action />` — reusable across every list screen
- [ ] Build custom `<PageHeader title action />` — consistent page title (Poppins) + primary action button pattern

### 1.3 Layout Shell

- [ ] Root layout (`app/layout.tsx`) — fonts, global styles
- [ ] `(staff)/layout.tsx` — sidebar/nav shell wrapping all logged-in pages
- [ ] Build nav with role-aware items: mock a `currentUser` object with a hardcoded `role` for now (swap for real session in Part 3)
- [ ] Nav items: POS, Products, Categories, Transactions, Dashboard (admin), Users (admin)

### 1.4 Screens — build each with hardcoded/mock data, covering all states from `DESIGN_PROMPT.md`

**Login**
- [ ] Build login form UI (username, password, submit)
- [ ] Build inline error state (fake validation trigger)

**POS / Checkout**
- [ ] Build product grid with mock product array (include some out-of-stock items)
- [ ] Build search bar (client-side filter over mock array)
- [ ] Build category filter tabs (mock categories)
- [ ] Build cart panel (Zustand store — this is real, not mocked, since it's pure client state)
- [ ] Build quantity stepper, remove item, clear cart actions
- [ ] Build checkout modal: amount received input, live change calculation (pure frontend math for now)
- [ ] Build insufficient-stock error state (trigger manually with a mock condition)
- [ ] Build on-screen receipt success state

**Product Management**
- [ ] Build product list (table/grid) with mock paginated data
- [ ] Build search + category filter controls
- [ ] Build add/edit product form (modal), with `zod` validation wired even though submit is fake
- [ ] Build delete confirmation dialog
- [ ] Build empty state (no products)

**Category Management**
- [ ] Build category list with mock data
- [ ] Build add/edit modal
- [ ] Build blocked-delete state (mock condition: category has products)

**User Management**
- [ ] Build user list table with role/status badges, mock data
- [ ] Build add/edit user form
- [ ] Build reset password confirmation dialog
- [ ] Build deactivate confirmation dialog

**Transaction History**
- [ ] Build transaction list with mock data, date range filter UI, cashier filter (admin-only visibility toggle)
- [ ] Build transaction detail (drawer or page) with mock line items
- [ ] Build void action + required-reason confirmation dialog
- [ ] Build voided-state visual treatment on detail view

**Stock Adjustment**
- [ ] Build adjustment form (increase/decrease toggle, quantity, reason) — accessible from product detail
- [ ] Build adjustment history list, mock data, color-coded increase/decrease

**Sales Dashboard**
- [ ] Build date range selector (default "Today")
- [ ] Build headline metric cards (total sales, transaction count) with mock numbers, `tabular-nums`
- [ ] Build best-sellers list/chart (`recharts`), mock data
- [ ] Build empty state (zeroed totals)

### 1.5 Frontend State Wiring (still mock-backed)

- [ ] Set up `stores/cart-store.ts` (Zustand) — this is real, cart logic doesn't need a backend
- [ ] Set up `lib/query-client.ts` (TanStack Query provider), even though queries return mock data for now
- [ ] Write `hooks/use-products.ts`, `use-transactions.ts` etc. returning mock arrays wrapped in a fake async delay (simulates loading state honestly)

**Checkpoint:** at the end of Part 1, you should be able to click through the entire app — login (fake), build a cart, "checkout" (fake), browse products, manage categories/users, view fake transaction history and dashboard — with zero backend running. This is your clickable template.

---

## Part 2 — Backend (Real API + Database)

Goal of this part: a fully working Go Fiber API with a real PostgreSQL database, tested independently of the frontend (via `curl`/Postman/HTTP client), following `TECH_SPEC.md`.

### 2.1 Project Setup

- [ ] `go mod init` for `brewpoint-api`
- [ ] Install dependencies: `fiber`, `gorm`, `gorm.io/driver/postgres`, `golang-jwt`, `bcrypt`, `golang-migrate`, `uuid`, `decimal`, `godotenv`
- [ ] Set up folder structure per `TECH_SPEC.md` Section 2.1
- [ ] Write `internal/config/config.go` — load env vars
- [ ] Write `.env` (backend) per `TECH_SPEC.md` Section 9

### 2.2 Database

- [ ] Set up PostgreSQL locally via Docker Compose
- [ ] Write `internal/database/postgres.go` — GORM connection setup
- [ ] Run `CREATE EXTENSION pgcrypto`
- [ ] Write initial migration (`000001_init_schema.up/down.sql`) with all 6 tables from `TECH_SPEC.md` Section 3.3
- [ ] Run migration, verify tables exist
- [ ] Add all indexes from `TECH_SPEC.md` Section 3.4
- [ ] Write GORM model structs for all 6 tables (`user/model.go`, `category/model.go`, `product/model.go`, `transaction/model.go`, `transaction_item` (embedded), `stock_adjustment/model.go`)
- [ ] Write a seed script: one admin user, a couple of categories, a handful of products

### 2.3 Helpers / Shared Packages (build these before the feature modules — everything depends on them)

- [ ] `pkg/response/response.go` — standard success/error envelope (per `TECH_SPEC.md` Section 4)
- [ ] `pkg/apperror/apperror.go` — typed errors → HTTP status mapping (per Section 8)
- [ ] `internal/auth/jwt.go` — issue/verify JWT helper functions
- [ ] Password hashing helper (bcrypt wrapper)
- [ ] `internal/middleware/logger.go` — request logging
- [ ] `internal/middleware/auth.go` — JWT cookie verification
- [ ] `internal/middleware/role.go` — `RequireRole("admin")` guard
- [ ] CORS middleware, configured for `CORS_ALLOWED_ORIGIN`

### 2.4 Auth Module

- [ ] `POST /auth/login` — verify credentials, issue JWT in httpOnly cookie
- [ ] `POST /auth/logout` — clear cookie
- [ ] `GET /auth/me` — return current user from JWT claims
- [ ] Test all three with `curl`/Postman before moving on

### 2.5 User Module (Admin only)

- [ ] Repository: create, list, get by ID, update, reset password, deactivate
- [ ] Service: business rules (unique username, can't deactivate last active admin)
- [ ] Handler: wire routes, apply `auth` + `role("admin")` middleware
- [ ] Test every endpoint independently

### 2.6 Category Module

- [ ] Repository: CRUD
- [ ] Service: block delete if category has products
- [ ] Handler: wire routes (write = admin only, read = any authenticated user)
- [ ] Test every endpoint

### 2.7 Product Module

- [ ] Repository: CRUD + `Search` (per `TECH_SPEC.md` Section 6 GORM example)
- [ ] Service: validation (non-negative price/stock), soft delete logic
- [ ] Handler: wire routes with pagination + search/category query params
- [ ] Test every endpoint, including search and out-of-stock filtering

### 2.8 Transaction Module (the critical one)

- [ ] Repository: create transaction + items, get by ID, list with filters
- [ ] Service: `Checkout()` — implement exactly as in `TECH_SPEC.md` Section 5 (GORM transaction + row locking)
- [ ] Service: `Void()` — mark voided, restore stock for each line item
- [ ] Handler: wire `POST /transactions`, `GET /transactions`, `GET /transactions/:id`, `PATCH /transactions/:id/void`
- [ ] **Manual concurrency test:** fire two simultaneous checkout requests for the same low-stock product (e.g. two parallel `curl` calls) and confirm only one succeeds — this validates the locking actually works, don't skip this
- [ ] Test void restores stock correctly

### 2.9 Stock Adjustment Module

- [ ] Repository: create adjustment, list by product
- [ ] Service: apply adjustment to product stock, enforce stock never goes below 0
- [ ] Handler: wire routes, admin only
- [ ] Test increase and decrease paths

### 2.10 Dashboard Module

- [ ] Repository: aggregate queries — total sales/count for a date range, best-sellers ranked by quantity
- [ ] Service: exclude voided transactions from all totals
- [ ] Handler: wire `GET /dashboard/summary`, `GET /dashboard/best-sellers`
- [ ] Test with the seeded data

### 2.11 Router Wiring

- [ ] `internal/router/router.go` — register all module routes under `/api/v1`
- [ ] `cmd/api/main.go` — load config, connect DB, build router, start Fiber
- [ ] Full manual pass: log in, then hit every single endpoint from `TECH_SPEC.md` Section 4 with a real HTTP client

**Checkpoint:** at the end of Part 2, the entire API works correctly on its own — provable via Postman/curl — completely independent of the frontend.

---

## Part 3 — Integration (Connect Frontend to Backend)

Goal: replace every mock in Part 1 with real calls to the API built in Part 2.

### 3.1 API Client Setup

- [ ] `lib/api-client.ts` — fetch wrapper: base URL from `NEXT_PUBLIC_API_BASE_URL`, `credentials: 'include'` (for the httpOnly cookie), standard error unwrapping from the response envelope
- [ ] `lib/types.ts` — TS types mirroring every API response shape from `TECH_SPEC.md` Section 4

### 3.2 Real Authentication

- [ ] Wire login form to `POST /auth/login`
- [ ] Wire `GET /auth/me` on app load to populate `currentUser` (replaces the mock object from Part 1)
- [ ] Wire logout button to `POST /auth/logout`
- [ ] Write `middleware.ts` — redirect unauthenticated requests to `/login`, redirect wrong-role requests away from admin-only pages
- [ ] Remove the hardcoded mock role from Part 1.3 nav — nav now reads the real session

### 3.3 Wire Each Module (real TanStack Query hooks replacing mock ones)

For each module below: replace the mock hook body with a real `useQuery`/`useMutation` call, remove the fake delay, and confirm the UI states (loading/error/empty) still behave correctly with real network conditions.

- [ ] **Products** — list, search, detail, create, update, delete (`use-products.ts`)
- [ ] **Categories** — list, create, update, delete
- [ ] **Users** — list, create, update, reset password, deactivate
- [ ] **POS/Checkout** — cart stays Zustand (unchanged), but checkout submit now calls `POST /transactions` for real; wire the real insufficient-stock error response into the existing error state UI
- [ ] **Transaction History** — list with real filters, detail, void action
- [ ] **Stock Adjustments** — submit + history, scoped to a real product ID
- [ ] **Dashboard** — real summary + best-sellers, date range triggers real refetch

### 3.4 Cache Invalidation (this is where TanStack Query earns its place)

- [ ] After creating/updating/deleting a product → invalidate the products query
- [ ] After a successful checkout → invalidate products (stock changed), transactions, and dashboard queries
- [ ] After a void → invalidate the specific transaction, transaction list, and dashboard queries
- [ ] After a stock adjustment → invalidate the product and its adjustment history

### 3.5 Full End-to-End Manual QA

Walk through every flow in `PRD.md` Section "User Flows" for real, start to finish:

- [ ] Flow 1: Login (correct + incorrect credentials)
- [ ] Flow 2: Admin adds a new product, sees it appear in the POS product grid
- [ ] Flow 3: Cashier completes a full checkout, stock decrements, receipt shows correctly
- [ ] Flow 3 (error path): attempt checkout on an item with 0 stock, confirm it's blocked with a clear message
- [ ] Flow 4: Admin reviews dashboard for today, then changes date range
- [ ] Admin voids a transaction, confirms stock is restored and the product is sellable again
- [ ] Admin performs a manual stock adjustment, confirms it reflects immediately in the product list
- [ ] Cashier attempts to access an admin-only page (Users) directly by URL — confirm they're blocked
- [ ] Log out, confirm session is cleared and protected pages redirect to login

**Checkpoint:** at the end of Part 3, BrewPoint is a fully working, real, end-to-end application — this is your MVP.

---

## Part 4 — Launch (v1.0, per `ROADMAP.md`)

- [ ] Dockerize backend (`Dockerfile` for the Go binary)
- [ ] Dockerize frontend (or deploy directly to Vercel)
- [ ] Deploy Postgres + backend (Railway/Fly.io/VPS)
- [ ] Deploy frontend (Vercel), pointing `NEXT_PUBLIC_API_BASE_URL` at the deployed backend
- [ ] Set production environment variables on both sides
- [ ] Re-run the seed script against the production database (demo admin + cashier account, sample products)
- [ ] Write the project README (setup instructions, architecture overview, screenshots)
- [ ] Do one final full walkthrough of Part 3.5's QA list against the **live** deployed URL, not localhost

**Once every box above is checked, MVP v1.0 is done — the rest of your journey continues in `ROADMAP.md` starting at v1.1 (indexing, Redis, rate limiting).**
