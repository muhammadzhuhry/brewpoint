# BrewPoint — MVP Build Checklist (Frontend-First)

**Purpose:** a step-by-step, checkable to-do list covering the entire MVP end-to-end. Use this as your personal reference while building — check items off as you go.

**Stack note:** BrewPoint MVP is built as **one Next.js app** — Route Handlers as the API layer, Drizzle ORM, PostgreSQL. There is no separate Go service for MVP (see `TECH_SPEC.md` v2.0 and Section 12 for the optional future split).

**Order:** Frontend UI first (builds a clickable template with mock data) → Backend logic (Route Handlers + Drizzle + database, added into the _same_ app) → Integration (swap mocks for real calls) → Launch.

Refer back to `PRD.md` for feature detail, `TECH_SPEC.md` for schema/API contracts, and `DESIGN_SYSTEM.md` for exact tokens.

---

## Part 1 — Frontend (UI Template, Mock Data)

Goal of this part: a fully clickable Next.js app with every screen built, using fake/hardcoded data — the database and API routes don't exist yet. This becomes your visual template and forces you to think through every UI state before wiring real data in.

### 1.1 Project Setup

- [x] `create-next-app` with TypeScript, App Router, Tailwind CSS — this single app (`brewpoint`) will hold both UI and API
- [x] Install and init shadcn/ui (`npx shadcn init`)
- [x] Set up folder structure per `TECH_SPEC.md` Section 2 (`app/`, `components/`, `lib/`, `stores/`, `hooks/`) — you can leave `app/api/`, `lib/db/`, and `lib/services/` empty for now, they get filled in Part 2
- [x] Install fonts: Poppins + Inter via `next/font/google` (`app/fonts.ts`)
- [x] Wire `--font-display` (Poppins) and `--font-body` (Inter) into Tailwind — done via `app/globals.css` `@theme inline` block (project uses Tailwind v4, no `tailwind.config.ts`)
- [x] Paste `DESIGN_SYSTEM.md` Section 2.5 CSS variables into `app/globals.css`
- [x] Add `--success`/`--warning` custom tokens on top of shadcn's default theme variables
- [x] Verify base layout renders with the correct fonts and background color before building anything else

### 1.2 Atomic / Reusable Components

Install shadcn primitives first, then build BrewPoint-specific compositions on top:

- [x] `npx shadcn add button` — verify `primary`/`secondary`/`outline`/`destructive`/`ghost` variants match `DESIGN_SYSTEM.md` 6.1
- [x] `npx shadcn add input`, `label`, `textarea`
- [x] `npx shadcn add select`, `dropdown-menu`
- [x] `npx shadcn add dialog` (modals), `sheet` (side drawers)
- [x] `npx shadcn add table`
- [x] `npx shadcn add card`
- [x] `npx shadcn add badge` — theme it for status tags (completed/voided/low-stock/out-of-stock/active/inactive) per 6.3
- [x] ~~`npx shadcn add form`~~ — shadcn no longer ships a single `form` component (confirmed via docs, 2026-07); used `npm install react-hook-form @hookform/resolvers zod` + `npx shadcn add field` instead, and the `<Controller>` + `<Field>`/`<FieldLabel>`/`<FieldError>` pattern in place of the old `<Form>`/`<FormField>`
- [x] `npx shadcn add tabs` — for category filter chips on POS screen
- [x] `npx shadcn add skeleton` — loading states
- [x] `npx shadcn add sonner` or `toast` — success/error notifications
- [x] Build custom `<ProductTile />` — used in POS grid, `radius-xl`, touch-friendly
- [x] Build custom `<StatusBadge status="..." />` — wraps `Badge`, maps status string → correct color per 6.3
- [x] Build custom `<NumericValue />` — wraps text with `tabular-nums`, used for all prices/stock counts
- [x] Build custom `<EmptyState title icon action />` — reusable across every list screen
- [x] Build custom `<PageHeader title action />` — consistent page title (Poppins) + primary action button pattern

### 1.3 Layout Shell

- [x] Root layout (`app/layout.tsx`) — fonts, global styles
- [x] `(staff)/layout.tsx` — sidebar/nav shell wrapping all logged-in pages
- [x] Build nav with role-aware items: mock a `currentUser` object with a hardcoded `role` for now (swap for the real session in Part 3)
- [x] Nav items: POS, Products, Categories, Transactions, Dashboard (admin), Users (admin)
- [x] Build sidebar brand header (logo tile + shop name) and account widget footer (avatar/initials, name, role, logout button) — added 2026-07 per `docs/references/sidebar.html`, not in the original PRD-derived checklist; logout button is UI-only for now, wired to a real `POST /api/v1/auth/logout` call in Part 3.2

### 1.4 Screens — build each with hardcoded/mock data, covering all states from `DESIGN_PROMPT.md`

**Order note (2026-07):** re-sequenced easiest → hardest per user preference, instead of the original PRD feature order. Login was already in progress so it stays first; everything after is ordered by build complexity, ending with Sales Dashboard (needs `recharts` + date-range aggregation — the least-familiar territory) and POS/Checkout (most interaction states/Zustand wiring) near the end.

**Refactor convention (2026-07):** each screen starts as one working `page.tsx` file (fastest way to get the logic right), but must be split before moving to the next screen — otherwise `page.tsx` balloons into a god file. Standard split, established on Products: `lib/types.ts` (shared types), `lib/validators/{module}.ts` (zod schema), `lib/mock-{module}.ts` (mock data), `components/{module}/*.tsx` (each dialog/sheet/table as its own component, receiving data + callbacks as props). `page.tsx` should end up as a thin orchestrator — state + wiring only, no large inline JSX blocks. Apply this same split to every screen below after its features are working, not just Products.

**Login**

- [x] Build login form UI (username, password, submit) — plus bonus: show/hide password toggle
- [x] Build inline error state (fake validation trigger) — checked against a small `MOCK_ACCOUNTS` map (client-side only), with shake animation + red borders; the reference's "Welcome back" success animation + real redirect stays deferred to Part 3.2 (needs a real API response, not mock)

**Category Management** _(simplest — single field, minimal states)_

- [x] Build category list with mock data
- [x] Build add/edit modal
- [x] Build blocked-delete state (mock condition: category has products)
- [x] Build category detail drawer (click a category card → side panel listing its assigned products, with rename/delete actions) — added 2026-07 per `docs/references/category_management.html`, not in the original PRD-derived checklist
- [x] Build empty state (no categories) — missing from the original checklist (found 2026-07 while building Products' empty state); `category_management.html` already defines it (`if (total === 0)`), just never implemented
- [x] Refactor into `lib/types.ts` + `lib/validators/category.ts` + `lib/mock-categories.ts` + `components/categories/*.tsx` split (avoid god file) — see "Refactor convention" note above; pattern already applied to Products as the reference

**Product Management** _(more fields + search/filter than Category)_

- [x] Build product list (table/grid) with mock paginated data
- [x] Build search + category filter controls
- [x] Build add/edit product form (modal), with `zod` validation wired even though submit is fake
- [x] Build delete confirmation dialog
- [x] Build empty state (no products) — plus a separate "no results" state when search/filter matches nothing (different icon/message, no CTA)
- [x] Build product detail drawer (click a row → side panel: image/avatar, category, price, stock, barcode, sold-in-transactions count, edit/delete actions for admin) — added 2026-07 per `docs/references/product_management.html`, not in the original PRD-derived checklist
- [x] Build "Reload" button that triggers the loading-skeleton state (fake/manual for now) — added 2026-07 per `docs/references/product_management.html`. **Not building:** the reference's "View as Admin/Cashier" toggle switch — that's a demo-only affordance for previewing both roles in the static mockup; our real app already derives role from `currentUser` (mocked in `(staff)/layout.tsx` since Part 1.3), so admin/cashier visibility should read from that, never a manual switch
- [x] Refactor into `lib/types.ts` + `lib/validators/product.ts` + `lib/mock-products.ts` + `components/products/*.tsx` split (avoid god file) — `page.tsx` reduced from ~920 to ~210 lines; this is the reference pattern for the "Refactor convention" noted above

**User Management** _(similar to Product, plus 2 extra confirmation flows)_

- [x] Build user list table with role/status badges, mock data
- [x] Build search + role filter controls — missing from the original checklist (found 2026-07, same gap pattern as Product/Category's search+filter); added for consistency with the other two list screens
- [x] Build add/edit user form (name, username, temporary password + "Generate password" button in add mode only, role toggle) — **no active/inactive toggle in the form** (decided 2026-07); activation state is only changed via the separate Deactivate/Reactivate dialog, not editable inline in the form — uses `zod` validation (decided 2026-07, for consistency with Products) via a mode-aware schema factory (`lib/validators/user.ts`)
- [x] Build reset password confirmation dialog — full 2-stage flow (decided 2026-07): confirm → generate + display the new temporary password with a "Copied" indicator, not a single-step confirmation
- [x] Build deactivate/reactivate confirmation dialog (bidirectional — same dialog, content flips based on current `active` state)
- [x] Build user detail drawer (click a row → side panel: avatar/initials, role + status pills, username, role description, joined date, last active; Edit + Reset password actions) — added 2026-07 per `docs/references/user_management.html`, not in the original PRD-derived checklist
- [x] Row-level quick actions: 2 icon buttons (Edit, Deactivate) matching Product/Category's inline-icon-button pattern — **not** the reference's ⋮ dropdown menu (decided 2026-07 for consistency across list screens); Reset password is only reachable via the detail drawer, not a row-level action
- [x] Built directly as a split structure from the start (`lib/types.ts`, `lib/validators/user.ts`, `lib/mock-users.ts`, `components/users/*.tsx`, thin `page.tsx`) — no separate refactor pass needed, unlike Product/Category which were refactored after the fact

**Stock Adjustment** _(small form + history list, naturally follows Product)_

- [x] Build as a standalone dedicated page (`/stock`, own sidebar nav item) — corrected 2026-07: originally worded as "accessible from product detail," but `docs/references/stock_management.html` is a full master-detail page layout, not a modal/tab off the product screen
- [x] Build product list/picker panel (search + All/Low-stock/Out-of-stock filter, clickable rows with avatar, category, stock count, color-coded status dot) — left panel of the master-detail layout, laid out flush against the page header/sidebar per the reference (2026-07)
- [x] Build selected-product header card in the right panel (avatar, name, category, current stock)
- [x] Build adjustment form (Increase/Decrease toggle, quantity input, preset reason chips + free-text reason, live "current → new stock" preview, submit button)
- [x] Build confirm-adjustment dialog (icon/color/title/message vary by increase vs decrease, shows current → new stock level preview)
- [x] Build adjustment history list, mock data, color-coded increase/decrease entries
- [x] Build success toast notification after an adjustment is recorded
- [x] Refactor into `lib/types.ts` (already has `StockAdjustment`) + `components/stock/*.tsx` split (avoid god file) — see "Refactor convention" note above; `page.tsx` now a thin orchestrator wiring `ProductPickerList`, `ProductHeaderCard`, `AdjustmentForm`, `AdjustmentHistory`, `ConfirmAdjustmentDialog`

**Transaction History** _(read/filter-heavy, plus a void flow)_

- [x] Build summary stat cards (Gross sales, Transactions, Avg. ticket, Voided count) — added 2026-07 per `docs/references/transaction_history.html`, not in the original PRD-derived checklist
- [x] Build transaction list with mock data: search by receipt no., status filter (All/Completed/Voided), cashier filter (admin-only visibility), date range shown as a **static label for now** — decided 2026-07: the reference itself never wires the date picker to real filtering (it's a fixed "Jul 7 – Jul 8, 2026" display), so a working calendar/date-range picker is deferred until it's actually needed, not built here
- [x] Build empty state (no transactions match filters) — same omission-fix pattern as Category/Product
- [x] Build pagination footer — same pattern as Products
- [x] Build transaction detail drawer with mock line items (receipt id, time, cashier, items with qty/price, subtotal/payment/change/total)
- [x] Build void action + required-reason confirmation dialog — preset reason chips + free-text textarea, same pattern as Stock Adjustment's reason field
- [x] Build voided-state visual treatment: banner (voided-by + reason) on the detail drawer, strikethrough total + voided status pill on the list row
- [x] Refactor stat cards + filter row + table + pagination out of `page.tsx` into `components/transactions/*.tsx` (avoid god file) — see "Refactor convention" note above; split into `TransactionStats`, `TransactionFilters`, `TransactionsTable`, alongside the already-separate `TransactionDetailSheet`/`VoidTransactionDialog`
- **Not building:** the reference's "View as Admin/Cashier" toggle — same reasoning as Product Management (2026-07): role comes from `currentUser` (mocked in `(staff)/layout.tsx`), never a manual switch

**POS / Checkout** _(most interaction states — real Zustand cart, live calculation, multiple error/success states)_

- [x] Build product grid using the existing `lib/mock-products.ts` (shared with Products/Stock, not a separate POS-only list) — decided 2026-07: keeps stock/price consistent across every screen instead of duplicating mock data, even though `docs/references/checkout.html`'s own demo data has more products/categories
- [x] Build top info bar: live date + ticking clock (updates every second via `setInterval`), shift label — added 2026-07 per `docs/references/checkout.html`, not in the original PRD-derived checklist; also restructured the left column into a fixed top zone (title/date-time/search/sort/chips) + separately-scrolling grid below, matching the reference's layout instead of scrolling everything together. **Hydration lesson (2026-07):** the clock's `now` state must start as `null` (same on server and client) and only get a real `new Date()` inside `useEffect` — initializing it eagerly via `useState(() => new Date())` causes a server/client text mismatch (Next.js hydration error), a different problem from the `Date.now()`-in-render **lint** rule we hit earlier on Stock/Transactions
- [x] Build search bar (client-side filter over mock array) — filters by product name only for now; barcode-scan matching can be added once barcode input is wired
- [x] Build sort dropdown (Popular / Name A–Z / Price low→high / Price high→low) — added 2026-07, not in the original checklist; "Popular" sorts by `product.txnCount` (real mock field, already used on the Product detail drawer), not a fake/decorative order like the reference's own demo data
- [x] Build category filter chips (icon + label + product count per category, scrollable strip) — original checklist just said "tabs"; the reference is richer than a plain tab row; categories derived from `products` (same pattern as Products page filter), not from `lib/mock-categories.ts`, so an empty category never shows as a selectable-but-empty option
- [x] Build product tile states: in-cart quantity badge, low-stock badge ("X left"), out-of-stock disabled tile, hover/selected border
- [x] Build empty state (no products match search/category) — built alongside search, now also covers the category filter via the same `filteredProducts` array
- [x] Build cart panel (Zustand store — this is real, not mocked, since it's pure client state) — `stores/cart-store.ts`, tracks `quantities`/`order` by product id (not a copy of product data)
- [x] Build cart empty state ("No items yet") — reuses the shared `EmptyState` component
- [x] Build quantity stepper, remove item, clear cart actions — removing is implicit (decrement to 0), matching the reference (no separate per-line delete button)
- [x] Build insufficient-stock error state — corrected 2026-07: this is **derived automatically** from `cart qty > product.stock` (highlighted cart line + banner + blocked checkout button), not a manually-triggered toggle as originally worded
- [x] Build checkout modal: amount received input, quick-cash suggestion buttons (Exact / round up to 5/10/20), live change calculation (pure frontend math for now), "Complete sale" disabled until received ≥ total — also switched `products` from a direct `MOCK_PRODUCTS` read to local `useState` here, since completing a sale needs to actually decrement stock
- [x] Build on-screen receipt success state: line items, subtotal/paid/change, Print button (decorative, no real print logic), New sale button (resets cart + closes receipt) — receipt ref counter (`TX-2042`, `TX-2043`, ...) is a plain `useState` counter, not `Date.now()`/`Math.random()`, matching the impure-function lint rule we hit earlier
- [x] Refactor `page.tsx` (was 704 lines) into `components/checkout/*.tsx` (avoid god file) — see "Refactor convention" note above; missed when this section's checklist was first expanded, unlike Products/Stock/Transaction History which each got this item from the start. Split into `CheckoutHeader`, `ProductGrid`, `CartPanel`, `CheckoutDialog`, `ReceiptOverlay`; `Receipt` type moved to `lib/types.ts` alongside the other shared types; `page.tsx` is now state + handlers + wiring only

**Sales Dashboard** _(hardest — new charting library + date-range aggregation logic)_

**Data approach (2026-07):** everything on this page except Low Stock uses a small set of hardcoded mock "snapshots," one per date-range period (Today / 7 days / 30 days) — including the delta badges — matching `docs/references/dashboard.html`'s own approach (`lib/mock-dashboard.ts`, one object per period). `MOCK_TRANSACTIONS` only spans 2 days, so computing a real "last 30 days" trend from it would be dishonest, not just simplified. Low Stock is the one exception: it reads real numbers from `lib/mock-products.ts` (same `getStockStatus` already used on Stock/Products), so it never disagrees with what those pages show.

- [x] Install `recharts`
- [x] Build date range selector: 3-option segmented toggle (Today / 7 days / 30 days) + read-only resolved date-range chip — corrected 2026-07: not a full calendar/date-range picker, matches the reference's own simpler control (same pattern as the Transaction History date filter)
- [x] Build 4 headline stat cards (Total sales, Transactions, Avg. ticket, Items sold) with mock numbers, `tabular-nums`, each with a delta badge (↑/↓ % vs previous period + a "vs yesterday" / "vs last week" / "vs prev. 30 days" note) — corrected 2026-07: original checklist only named 2 of the 4 cards and missed the delta badges entirely
- [x] Build main "Sales by hour" (Today) / "Sales by day" (7/30 days) bar chart using `recharts`'s `BarChart` — decided 2026-07: the one real chart on the page (see data-approach note above); bar labels/granularity change per selected period; per-bar color (`<Cell>`) highlights the peak bar in navy, rest in light blue, matching the reference
- [x] Build "Best sellers" list (rank, name, qty sold, horizontal progress bar) — added 2026-07 per reference; plain styled bars, **not** a `recharts` component — it's a ranked list, not a chart; progress bar reuses the `--accent` token (already the same blue as the reference)
- [x] Build "Sales by category" horizontal bar breakdown (% share per category) — added 2026-07 per reference, not in the original checklist; also plain styled bars, not `recharts`
- [x] Build "Low stock" panel (product name + status badge, "Out of stock" vs "X left") — added 2026-07 per reference; the one section on this page backed by real data (`lib/mock-products.ts`), not a per-period snapshot; sorted ascending by stock, doesn't change with the period toggle (current stock isn't a "per period" concept)
- [x] Build empty state (zeroed totals) — no reference guidance for this (the reference's own mock data is never empty); follows the same `EmptyState` pattern used on every other list screen. Unreachable via the UI right now since all 3 mock snapshots in `lib/mock-dashboard.ts` have real (non-zero) numbers — verified by temporarily hardcoding `hasNoSales = true`, not by triggering it through the toggle; will become reachable for real once Part 3 wires in a live API that can return a genuinely empty day
- [x] Refactor `page.tsx` (was 335 lines) into `components/dashboard/*.tsx` (avoid god file) — see "Refactor convention" note above; add this item up front next time a section's checklist gets expanded (missed on both this section and Checkout until pointed out afterward). Split into `DashboardHeader`, `StatCard` + `StatsGrid`, `SalesChart`, `BestSellers`, `CategoryBreakdown`, `LowStock`; `page.tsx` is now state + the empty-state branch + wiring only

### 1.5 Frontend State Wiring (still mock-backed)

**Scope decision (2026-07):** the TanStack Query provider + hooks are set up now as a **pattern**, demonstrated on 2 modules only (Products, Transactions) — existing pages are **not** rewired to consume them yet; every page keeps its current `useState(MOCK_X)` for now. Rewiring each remaining screen (Categories, Users, Stock, Dashboard) to the hook layer is deferred to happen screen-by-screen alongside Part 3.3, where the mock hook body gets swapped for a real API call anyway — folding both changes into one pass avoids touching each page twice.

- [x] Set up `stores/cart-store.ts` (Zustand) — this is real, cart logic doesn't need a backend — already built during POS/Checkout (`quantities`/`order` state + `addItem`/`increment`/`decrement`/`removeItem`/`clearCart` actions)
- [x] Install `@tanstack/react-query`
- [x] Set up `lib/query-client.ts` — a shared `QueryClient` instance (sane defaults: e.g. `staleTime` so mock data doesn't needlessly "refetch" on every focus)
- [x] Wrap the app in a `QueryClientProvider` — needs its own small `"use client"` provider component (`components/providers/query-provider.tsx`), since `app/layout.tsx` is a Server Component and can't hold client-side context directly; `RootLayout` itself stays a Server Component, it just renders the client provider around `children`
- [x] Write `hooks/use-products.ts` as the reference pattern: `useQuery({ queryKey: ["products"], queryFn: ... })` wrapping `MOCK_PRODUCTS` in an artificial `setTimeout` delay, so the loading state is genuine rather than instant — **not yet wired into `app/(staff)/products/page.tsx`**, just the hook itself
- [x] Write `hooks/use-transactions.ts` following the same pattern, as the second example — also not wired into the page yet
- [ ] Leave `use-categories.ts`, `use-users.ts`, `use-stock-adjustments.ts`, `use-dashboard.ts` for later — build each one only when its page actually gets rewired during Part 3.3, not now

**Checkpoint:** at the end of Part 1, you should be able to click through the entire app — login (fake), build a cart, "checkout" (fake), browse products, manage categories/users, view fake transaction history and dashboard — with zero database or API routes existing yet. This is your clickable template.

---

## Part 2 — Backend (Route Handlers + Drizzle, Same App)

Goal of this part: fill in `app/api/v1/**`, `lib/db/`, and `lib/services/` inside the **same Next.js app** — a fully working API you can test independently with `curl`/Postman before touching the frontend again, following `TECH_SPEC.md`.

### 2.1 Database Setup

- [x] Set up PostgreSQL locally via Docker Compose — `docker-compose.yml` (service `db`, Postgres 16, named volume for persistence) + `.env` with `DATABASE_URL`; container running as `brewpoint-db-1`
- [x] Install `drizzle-orm`, `drizzle-kit`, `postgres` (postgres.js driver)
- [x] Write `lib/db/schema.ts` with all 6 tables from `TECH_SPEC.md` Section 3.3
- [x] Write `lib/db/index.ts` — Drizzle client instance
- [x] Configure `drizzle.config.ts`
- [x] Run `CREATE EXTENSION pgcrypto` (or use `defaultRandom()`, which Drizzle handles without the extension via `gen_random_uuid()` — confirm which your Postgres version needs) — confirmed 2026-07: not needed, `gen_random_uuid()` has been built into Postgres core since v13, and `docker-compose.yml` runs `postgres:16`
- [x] Run `npx drizzle-kit generate` → review the generated SQL → `npx drizzle-kit migrate` — verified directly against the container (`docker exec brewpoint-db-1 psql ...`): all 6 tables exist in `brewpoint_db`
- [x] Add the manual index migration from `TECH_SPEC.md` Section 3.4 (GIN/full-text index isn't native to Drizzle's schema syntax yet) — `drizzle/0001_add-indexes.sql` via `drizzle-kit generate --custom`; verified all 9 indexes exist (`docker exec brewpoint-db-1 psql ... -c "\di"`)
- [x] Write `lib/db/seed.ts` — one admin user, a couple of categories, a handful of products. Run it. — `npm run db:seed` (`tsx --env-file=.env lib/db/seed.ts`); the `--env-file` flag was needed since, unlike Next.js, `tsx` doesn't auto-load `.env` — without it, `postgres.js` silently fell back to a default connection using the OS username instead of erroring loudly. Verified via `docker exec brewpoint-db-1 psql ...`: 1 admin (`Marcus Bell`), 2 categories, 3 products

### 2.2 Helpers / Shared Packages (build these before the feature modules — everything depends on them)

- [x] `lib/api-response.ts` — standard success/error envelope helpers (`ok()`, `fail()`)
- [x] `lib/app-error.ts` — `AppError` class + error code → HTTP status mapping (per `TECH_SPEC.md` Section 8)
- [x] A shared wrapper/handler utility that catches `AppError` thrown inside a Route Handler and formats the envelope + status automatically — `lib/api-handler.ts`, `withErrorHandling()`
- [x] `lib/auth/jwt.ts` — sign/verify JWT using `jose`
- [x] Password hashing helper using `bcryptjs` — built early, ahead of this checklist's order, as `lib/auth/password.ts` (`hashPassword`/`verifyPassword`) — `lib/db/seed.ts` in 2.1 needed it immediately (`password_hash` is `NOT NULL`), so it couldn't wait until this section
- [x] `lib/auth/session.ts` — `requireAuth(role?)` helper (per `TECH_SPEC.md` Section 7) — dropped the unused `req` param from the spec's example signature, and corrected `cookies()`/`verifyJwt()` to be properly `await`-ed (both are async in our Next.js/jose versions, unlike the spec's illustrative snippet)
- [x] `middleware.ts` — redirect-level protection for unauthenticated requests — must live at the project root (sibling to `package.json`), not under `lib/`; caught and moved from `lib/auth/middleware.ts` after it was first created in the wrong place
- [x] `lib/validators/` — start the shared `zod` schema files (one per module), reused later by both Route Handlers and frontend forms — `product.ts`/`user.ts` already exist from Part 1's frontend forms; decided 2026-07 to defer creating the rest (categories, stock-adjustments, etc.) until each module's Route Handler section (2.4–2.8) actually needs them, same pattern as the 1.5 TanStack Query hooks decision. **Known gap to fix in 2.6:** `productSchema.category` currently stores the category **name** (fine for Part 1's mock data), but `lib/db/schema.ts` needs `categoryId` (a UUID) — this schema must be adjusted when the real Products Route Handler is built, not before

### 2.3 Auth Routes

- [x] `app/api/v1/auth/login/route.ts` — verify credentials, issue JWT in httpOnly cookie — same error message ("Invalid username or password") for both "user not found" and "wrong password", so a caller can't enumerate valid usernames; not yet tested with `curl` (see last item below, waiting on logout/me too)
- [x] `app/api/v1/auth/logout/route.ts` — clear cookie
- [x] `app/api/v1/auth/me/route.ts` — return current user from JWT claims — added `name` to `SessionClaims`/`signJwt` payload (in `login/route.ts`) so `/me` can answer straight from the decoded token, no extra DB lookup, matching this item's own wording ("from JWT claims")
- [x] Test all three with `curl`/Postman before moving on — login (correct + wrong password), `/me` with and without cookie (blocked by `middleware.ts` when missing), logout then `/me` again (correctly 401 after cookie cleared)

### 2.4 User Module (Admin only)

- [x] `lib/services/user-service.ts` — create, list, get by ID, update, reset password, deactivate; unique username check, "can't deactivate last active admin" rule
- [x] `app/api/v1/users/route.ts` (GET list / POST create), `app/api/v1/users/[id]/route.ts` (PUT update / PATCH `isActive` toggle), `.../reset-password/route.ts` (POST) — wired with `requireAuth("admin")` in every handler. Added backend-specific `createUserBodySchema`/`updateUserBodySchema`/`resetPasswordBodySchema`/`setActiveBodySchema` to `lib/validators/user.ts` (lowercase `role` to match `roleEnum`, no `existingUsernames` param — the frontend-only `getUserFormSchema` wasn't reusable as-is). Also fixed `lib/api-handler.ts` to catch `ZodError` → `400 BAD_REQUEST` (it was only catching `AppError` before, so a failed `.parse()` would've fallen through to a generic 500) — this fix benefits every future route handler, not just this module
- [x] Test every endpoint independently — list, create, duplicate-username (409), update, reset-password, deactivate, deactivate-last-admin (409), and no-session access (401), all via `curl`

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
- [ ] Add login success/failure transition states (deferred from Part 1.4 — see `docs/references/login.html`): on successful response, briefly show a "Welcome back {name}" confirmation (checkmark icon, "Signing you in…") before redirecting; on failed response, apply the reference's `shake` animation to the error banner. Only makes sense here, not in Part 1.4, since Part 1 has no real success/failure signal to react to — this is real API response handling, not mock UI
- [ ] Wire `GET /api/v1/auth/me` on app load to populate `currentUser` (replaces the mock object from Part 1)
- [ ] Wire logout button to `POST /api/v1/auth/logout`
- [ ] Confirm `middleware.ts` correctly redirects unauthenticated requests to `/login`, and that admin-only pages reject cashier sessions (double-check the actual authorization still happens via `requireAuth` inside each Route Handler, not just the middleware)
- [ ] Remove the hardcoded mock role from Part 1.3 nav — nav now reads the real session

### 3.3 Wire Each Module (real TanStack Query hooks replacing mock ones)

**Note (2026-07):** only Products and Transactions have a mock hook already (`hooks/use-products.ts`, `hooks/use-transactions.ts`, built in Part 1.5 as the pattern) — and neither is wired into its page yet, they still read `MOCK_X` via `useState` directly. Categories/Users/Stock Adjustments/Dashboard have **no hook file at all** yet (deferred on purpose, see the 1.5 scope note). So "replace the mock hook body" below means two different amounts of work: for Products/Transactions, swap the `queryFn` to a real `lib/api-client.ts` call _and_ rewire the page off `useState(MOCK_X)` onto the hook; for the other four, write the hook from scratch (real API call from day one) _and_ wire the page — there's no mock version to delete first.

For each module below: end up with a real `useQuery`/`useMutation` call against `lib/api-client.ts` (no fake delay), the page actually consuming the hook (not `useState(MOCK_X)`), and confirm the UI states (loading/error/empty) still behave correctly with real network conditions.

- [ ] **Products** — list, search, detail, create, update, delete (`use-products.ts`); wire the "Reload" button (built in Part 1.4) to a real TanStack Query `refetch()` instead of the fake loading-skeleton timer
- [ ] **Categories** — list, create, update, delete (`use-categories.ts` doesn't exist yet — create it here)
- [ ] **Users** — list, create, update, reset password, deactivate (`use-users.ts` doesn't exist yet — create it here)
- [ ] **POS/Checkout** — cart stays Zustand (unchanged), but checkout submit now calls `POST /api/v1/transactions` for real; wire the real `INSUFFICIENT_STOCK` error response into the existing error state UI
- [ ] **Transaction History** — list with real filters, detail, void action (`use-transactions.ts`)
- [ ] **Stock Adjustments** — submit + history, scoped to a real product ID (`use-stock-adjustments.ts` doesn't exist yet — create it here)
- [ ] **Dashboard** — real summary + best-sellers, date range triggers real refetch (`use-dashboard.ts` doesn't exist yet — create it here)

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
