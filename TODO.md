# BrewPoint — MVP Build Checklist (Frontend-First)

**Purpose:** a step-by-step, checkable to-do list covering the entire MVP end-to-end. Use this as your personal reference while building — check items off as you go.

**Stack note:** BrewPoint MVP is built as **one Next.js app** — Route Handlers as the API layer, Drizzle ORM, PostgreSQL. There is no separate Go service for MVP (see `TECH_SPEC.md` v2.0 and Section 12 for the optional future split).

**Order:** Frontend UI first (builds a clickable template with mock data) → Backend logic (Route Handlers + Drizzle + database, added into the *same* app) → Integration (swap mocks for real calls) → Launch.

Refer back to `PRD.md` for feature detail, `TECH_SPEC.md` for schema/API contracts, and `DESIGN_SYSTEM.md` for exact tokens.

---

## Part 1 — Frontend (UI Template, Mock Data)

Goal of this part: a fully clickable Next.js app with every screen built, using fake/hardcoded data — the database and API routes don't exist yet. This becomes your visual template and forces you to think through every UI state before wiring real data in.

### 1.1 Project Setup

- [ ] `create-next-app` with TypeScript, App Router, Tailwind CSS — this single app (`brewpoint-web`) will hold both UI and API
- [ ] Install and init shadcn/ui (`npx shadcn init`)
- [ ] Set up folder structure per `TECH_SPEC.md` Section 2 (`app/`, `components/`, `lib/`, `stores/`, `hooks/`) — you can leave `app/api/`, `lib/db/`, and `lib/services/` empty for now, they get filled in Part 2
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
- [ ] Build nav with role-aware items: mock a `currentUser` object with a hardcoded `role` for now (swap for the real session in Part 3)
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
- [ ] Set up TanStack Query provider (`lib/query-client.ts`), even though queries return mock data for now
- [ ] Write `hooks/use-products.ts`, `use-transactions.ts` etc. returning mock arrays wrapped in a fake async delay (simulates loading state honestly)

**Checkpoint:** at the end of Part 1, you should be able to click through the entire app — login (fake), build a cart, "checkout" (fake), browse products, manage categories/users, view fake transaction history and dashboard — with zero database or API routes existing yet. This is your clickable template.

---

## Part 2 — Backend (Route Handlers + Drizzle, Same App)

Goal of this part: fill in `app/api/v1/**`, `lib/db/`, and `lib/services/` inside the **same Next.js app** — a fully working API you can test independently with `curl`/Postman before touching the frontend again, following `TECH_SPEC.md`.

### 2.1 Database Setup

- [ ] Set up PostgreSQL locally via Docker Compose
- [ ] Install `drizzle-orm`, `drizzle-kit`, `postgres` (postgres.js driver)
- [ ] Write `lib/db/schema.ts` with all 6 tables from `TECH_SPEC.md` Section 3.3
- [ ] Write `lib/db/index.ts` — Drizzle client instance
- [ ] Configure `drizzle.config.ts`
- [ ] Run `CREATE EXTENSION pgcrypto` (or use `defaultRandom()`, which Drizzle handles without the extension via `gen_random_uuid()` — confirm which your Postgres version needs)
- [ ] Run `npx drizzle-kit generate` → review the generated SQL → `npx drizzle-kit migrate`
- [ ] Add the manual index migration from `TECH_SPEC.md` Section 3.4 (GIN/full-text index isn't native to Drizzle's schema syntax yet)
- [ ] Write `lib/db/seed.ts` — one admin user, a couple of categories, a handful of products. Run it.

### 2.2 Helpers / Shared Packages (build these before the feature modules — everything depends on them)

- [ ] `lib/api-response.ts` — standard success/error envelope helpers (`ok()`, `fail()`)
- [ ] `lib/app-error.ts` — `AppError` class + error code → HTTP status mapping (per `TECH_SPEC.md` Section 8)
- [ ] A shared wrapper/handler utility that catches `AppError` thrown inside a Route Handler and formats the envelope + status automatically
- [ ] `lib/auth/jwt.ts` — sign/verify JWT using `jose`
- [ ] Password hashing helper using `bcryptjs`
- [ ] `lib/auth/session.ts` — `requireAuth(req, role?)` helper (per `TECH_SPEC.md` Section 7)
- [ ] `middleware.ts` — redirect-level protection for unauthenticated requests
- [ ] `lib/validators/` — start the shared `zod` schema files (one per module), reused later by both Route Handlers and frontend forms

### 2.3 Auth Routes

- [ ] `app/api/v1/auth/login/route.ts` — verify credentials, issue JWT in httpOnly cookie
- [ ] `app/api/v1/auth/logout/route.ts` — clear cookie
- [ ] `app/api/v1/auth/me/route.ts` — return current user from JWT claims
- [ ] Test all three with `curl`/Postman before moving on

### 2.4 User Module (Admin only)

- [ ] `lib/services/user-service.ts` — create, list, get by ID, update, reset password, deactivate; unique username check, "can't deactivate last active admin" rule
- [ ] `app/api/v1/users/route.ts`, `app/api/v1/users/[id]/route.ts`, `.../reset-password/route.ts` — wire with `requireAuth(req, "admin")`
- [ ] Test every endpoint independently

### 2.5 Category Module

- [ ] `lib/services/category-service.ts` — CRUD, block delete if category has products
- [ ] `app/api/v1/categories/route.ts`, `[id]/route.ts` — write = admin only, read = any authenticated user
- [ ] Test every endpoint

### 2.6 Product Module

- [ ] `lib/services/product-service.ts` — CRUD + `searchProducts()` (name/barcode search, category filter, pagination)
- [ ] `app/api/v1/products/route.ts`, `[id]/route.ts` — validation (non-negative price/stock), soft delete logic
- [ ] Test every endpoint, including search and out-of-stock filtering

### 2.7 Transaction Module (the critical one)

- [ ] `lib/services/transaction-service.ts` — implement `checkout()` exactly as in `TECH_SPEC.md` Section 5 (`db.transaction()` + `.for("update")`)
- [ ] Same service — implement `voidTransaction()`: mark voided, restore stock for each line item
- [ ] `app/api/v1/transactions/route.ts`, `[id]/route.ts`, `[id]/void/route.ts`
- [ ] **Manual concurrency test:** fire two simultaneous checkout requests for the same low-stock product (two parallel `curl` calls) and confirm only one succeeds — this validates the locking actually works, don't skip this
- [ ] Test void restores stock correctly

### 2.8 Stock Adjustment Module

- [ ] `lib/services/stock-adjustment-service.ts` — create adjustment, apply to product stock, enforce stock never goes below 0
- [ ] `app/api/v1/products/[id]/stock-adjustments/route.ts` — admin only
- [ ] Test increase and decrease paths

### 2.9 Dashboard Module

- [ ] `lib/services/dashboard-service.ts` — aggregate queries: total sales/count for a date range, best-sellers ranked by quantity, excluding voided transactions
- [ ] `app/api/v1/dashboard/summary/route.ts`, `app/api/v1/dashboard/best-sellers/route.ts`
- [ ] Test with the seeded data

### 2.10 Full API Pass

- [ ] Log in via `curl`/Postman, then hit every single endpoint from `TECH_SPEC.md` Section 4 with a real HTTP client, saving the session cookie between requests
- [ ] Confirm every error case returns the right `code`/status from `TECH_SPEC.md` Section 8 (wrong password, wrong role, insufficient stock, not found, etc.)

**Checkpoint:** at the end of Part 2, the entire API works correctly on its own — provable via Postman/curl — even though the frontend built in Part 1 still shows mock data. The two halves haven't been connected yet.

---

## Part 3 — Integration (Connect Frontend to Backend)

Goal: replace every mock in Part 1 with real calls to the Route Handlers built in Part 2. Because it's all one app on the same origin, there's no CORS configuration and the httpOnly cookie is sent automatically — integration here is simpler than a two-service setup.

### 3.1 API Client Setup

- [ ] `lib/api-client.ts` — fetch wrapper: relative base path (`/api/v1`), standard error unwrapping from the response envelope
- [ ] `lib/types.ts` — TS types mirroring every API response shape (can often be inferred directly from `lib/db/schema.ts` via Drizzle's `$inferSelect`, reducing duplication)

### 3.2 Real Authentication

- [ ] Wire login form to `POST /api/v1/auth/login`
- [ ] Wire `GET /api/v1/auth/me` on app load to populate `currentUser` (replaces the mock object from Part 1)
- [ ] Wire logout button to `POST /api/v1/auth/logout`
- [ ] Confirm `middleware.ts` correctly redirects unauthenticated requests to `/login`, and that admin-only pages reject cashier sessions (double-check the actual authorization still happens via `requireAuth` inside each Route Handler, not just the middleware)
- [ ] Remove the hardcoded mock role from Part 1.3 nav — nav now reads the real session

### 3.3 Wire Each Module (real TanStack Query hooks replacing mock ones)

For each module below: replace the mock hook body with a real `useQuery`/`useMutation` call against `lib/api-client.ts`, remove the fake delay, and confirm the UI states (loading/error/empty) still behave correctly with real network conditions.

- [ ] **Products** — list, search, detail, create, update, delete (`use-products.ts`)
- [ ] **Categories** — list, create, update, delete
- [ ] **Users** — list, create, update, reset password, deactivate
- [ ] **POS/Checkout** — cart stays Zustand (unchanged), but checkout submit now calls `POST /api/v1/transactions` for real; wire the real `INSUFFICIENT_STOCK` error response into the existing error state UI
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

- [ ] Provision managed PostgreSQL (Neon, Supabase, or Railway Postgres)
- [ ] Deploy the Next.js app to Vercel (single deployment — UI and API together)
- [ ] Set production environment variables (`DATABASE_URL`, `JWT_SECRET`) in Vercel's project settings
- [ ] Run `drizzle-kit migrate` against the production database
- [ ] Re-run the seed script against the production database (demo admin + cashier account, sample products)
- [ ] Write the project README (setup instructions, architecture overview, screenshots)
- [ ] Do one final full walkthrough of Part 3.5's QA list against the **live** deployed URL, not localhost

**Once every box above is checked, MVP v1.0 is done — the rest of your journey continues in `ROADMAP.md` starting at v1.1 (indexing, Redis via Upstash, rate limiting).**
