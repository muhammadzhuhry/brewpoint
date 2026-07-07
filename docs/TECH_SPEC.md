# BrewPoint — Technical Specification

**Version:** 2.0 · **Stack:** Next.js (Route Handlers) + Drizzle ORM + PostgreSQL
**Status:** MVP Definition · **Companion docs:** `PRD.md`, `ROADMAP.md`

> **Change from v1.0:** BrewPoint's backend is no longer a separate Go Fiber service. For the MVP, the entire application — UI and API — lives in **one Next.js app**, using Route Handlers as the API layer and Drizzle ORM talking directly to PostgreSQL. This was a deliberate scope decision to focus the initial learning curve on Next.js fullstack patterns. See Section 1.2 for why the API is still designed as if it were a separate service — that decision is what keeps a future split to a Go backend cheap.

---

## 1. Architecture Overview

### 1.1 Current Architecture (MVP)

BrewPoint is a **single Next.js application** — a monolith in the truest sense, but with internal boundaries designed to stay easy to pull apart later.

```
[Browser]
    |
    v
[Next.js App Router]
    |
    |-- Server/Client Components  ---->  fetch()  ---->  |
    |                                                      |
    v                                                      v
[Route Handlers: app/api/v1/**/route.ts]  <-------------- same origin, JWT in httpOnly cookie
    |
    v
[Service layer: lib/services/*] -> [Drizzle ORM: lib/db/*] -> [PostgreSQL]
```

**Why this layering (Route Handler → Service → Drizzle query):**

| Layer                   | Responsibility                                                                      | Why it's separated                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Route Handler           | Parse request, call service, shape HTTP response                                    | Keeps HTTP concerns (status codes, JSON) out of business logic — this is the direct equivalent of the old Go `handler` layer |
| Service                 | Business rules (e.g. "checkout must be atomic," "cannot deactivate the last admin") | Testable independently of HTTP, reusable if called from a Server Action or a cron job later                                  |
| Drizzle query functions | Typed queries against PostgreSQL                                                    | Equivalent of the old `repository` layer — isolated so the query logic is easy to find and easy to port later                |

This mirrors the exact same Handler → Service → Repository shape from the original Go design (see `TECH_SPEC.md` git history if you want to compare) — only the language and the specific tools changed. The discipline of _not_ putting business logic directly in a Route Handler or a React component is what makes Section 1.2 possible.

### 1.2 Why the API Is Still Built as Route Handlers, Not Server Actions

This is the single most important architectural decision in this revision.

Next.js gives two ways to handle mutations/data fetching: **Server Actions** (functions called directly from components, tightly coupled to the React tree) and **Route Handlers** (`app/api/**/route.ts`, plain HTTP endpoints, framework-agnostic).

**Decision: use Route Handlers exclusively, structured to mirror a REST API** — same URL paths, same request/response shapes, same status codes as if this were a separate service. `lib/api-client.ts` on the frontend calls these via `fetch()`, exactly like it would call an external API.

**Why this matters for your stated plan (split to a Go backend later):**

| If built with Server Actions                                                                 | If built with Route Handlers (this decision)                                                                                   |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Data mutations are direct function calls baked into components                               | Data access goes through `fetch()` calls to `/api/v1/...` — already decoupled                                                  |
| Migrating to a separate backend means **rewriting how every component fetches/mutates data** | Migrating to a separate backend means **changing one environment variable** (`API_BASE_URL`) and deleting the `app/api` folder |
| Harder to test the "API" in isolation (it's not really an API)                               | Route Handlers can be hit directly with `curl`/Postman, same as a real API, for tests                                          |

In other words: this decision costs almost nothing today, and is the entire reason "add a Go backend later" stays a cheap enhancement instead of a rewrite.

### 1.3 Why Drizzle (instead of Prisma or raw SQL)

| Aspect                                | Prisma                                                 | Raw SQL (`pg`/`postgres.js`) | Drizzle                                                                                                              |
| ------------------------------------- | ------------------------------------------------------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Query style                           | Abstracted, declarative                                | Fully manual                 | Thin builder, close to SQL — you can mostly read the SQL it will run                                                 |
| Row locking (`SELECT ... FOR UPDATE`) | Not supported in the query builder — needs `$queryRaw` | Explicit but verbose         | **Native** — `.for("update")`                                                                                        |
| Type safety                           | Generated client, very mature                          | None (manual typing)         | Full inference from schema, no codegen step needed                                                                   |
| Migrations                            | `prisma migrate`, mature tooling                       | Fully manual                 | `drizzle-kit generate`/`migrate` — schema-as-code, review-able SQL output                                            |
| Learning value                        | Trades SQL visibility for DX                           | Forces full understanding    | Keeps SQL visible while still removing boilerplate — closest analog to the GORM tradeoff from the original Go design |

**Decision: Drizzle ORM (`drizzle-orm` + `drizzle-kit`) with the `postgres.js` driver.** This preserves the same design property the original spec cared about: checkout concurrency safety is implemented with an explicit, visible `SELECT ... FOR UPDATE`, not hidden behind an abstraction.

---

## 2. Project Structure

Single Next.js app — no separate `backend/` or `frontend/` folders anymore.

```
brewpoint/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── me/route.ts
│   │       ├── users/
│   │       │   ├── route.ts                # GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.ts            # GET, PATCH
│   │       │       └── reset-password/route.ts
│   │       ├── categories/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── products/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── stock-adjustments/route.ts
│   │       ├── transactions/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── void/route.ts
│   │       └── dashboard/
│   │           ├── summary/route.ts
│   │           └── best-sellers/route.ts
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   └── (staff)/
│       ├── layout.tsx
│       ├── pos/page.tsx
│       ├── dashboard/page.tsx
│       ├── products/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── categories/page.tsx
│       ├── users/page.tsx
│       └── transactions/
│           ├── page.tsx
│           └── [id]/page.tsx
│
├── components/
│   ├── ui/                            # shadcn/ui primitives
│   ├── pos/
│   │   ├── product-grid.tsx
│   │   ├── cart.tsx
│   │   └── checkout-modal.tsx
│   ├── products/
│   └── dashboard/
│
├── lib/
│   ├── db/
│   │   ├── schema.ts                  # Drizzle schema — single source of truth for tables
│   │   ├── index.ts                   # Drizzle client instance
│   │   └── seed.ts                    # seed script
│   │
│   ├── services/                      # business logic — the "Service" layer
│   │   ├── auth-service.ts
│   │   ├── user-service.ts
│   │   ├── category-service.ts
│   │   ├── product-service.ts
│   │   ├── transaction-service.ts     # checkout + void logic lives here
│   │   ├── stock-adjustment-service.ts
│   │   └── dashboard-service.ts
│   │
│   ├── auth/
│   │   ├── jwt.ts                     # sign/verify JWT
│   │   └── session.ts                 # cookie helpers, current-user lookup
│   │
│   ├── api-client.ts                  # fetch wrapper used by the frontend
│   ├── api-response.ts                # standard response envelope helpers
│   ├── app-error.ts                   # typed errors -> HTTP status mapping
│   ├── types.ts                       # shared TS types (mirrors schema + API shapes)
│   └── validators/                    # zod schemas, shared by Route Handlers and forms
│       ├── product.ts
│       ├── transaction.ts
│       └── ...
│
├── stores/
│   └── cart-store.ts                  # Zustand — cart state
│
├── hooks/
│   ├── use-products.ts                # TanStack Query hooks
│   └── use-transactions.ts
│
├── drizzle/                           # drizzle-kit generated SQL migrations
│   └── 0000_init.sql
│
├── middleware.ts                      # route protection (auth + role)
├── drizzle.config.ts
├── .env
└── package.json
```

**What moved where, compared to the old two-service design:**

| Old (Go service)                  | New (Next.js)                                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `internal/{module}/handler.go`    | `app/api/v1/{module}/route.ts`                                                                                             |
| `internal/{module}/service.go`    | `lib/services/{module}-service.ts`                                                                                         |
| `internal/{module}/repository.go` | Drizzle queries, called from the service file directly (no separate repository file needed at this scale — see note below) |
| `internal/middleware/auth.go`     | `middleware.ts` + `lib/auth/session.ts`                                                                                    |
| `pkg/response`, `pkg/apperror`    | `lib/api-response.ts`, `lib/app-error.ts`                                                                                  |

> **Note on the Repository layer:** at BrewPoint's MVP scale, a separate repository file per module is often unnecessary ceremony in TypeScript — Drizzle queries are already type-safe and easy to co-locate with the service function that uses them. If a module's queries grow complex enough to want reuse across services, extract a `lib/repositories/{module}.ts` file at that point rather than upfront.

---

## 3. Database Design

_(Unchanged from v1.0 — the relational model doesn't depend on which language/ORM accesses it.)_

### 3.1 Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : "processes (cashier_id)"
    USERS ||--o{ TRANSACTIONS : "voids (voided_by)"
    USERS ||--o{ STOCK_ADJUSTMENTS : "performs (admin_id)"
    CATEGORIES ||--o{ PRODUCTS : "groups"
    PRODUCTS ||--o{ TRANSACTION_ITEMS : "sold as"
    PRODUCTS ||--o{ STOCK_ADJUSTMENTS : "adjusted"
    TRANSACTIONS ||--|{ TRANSACTION_ITEMS : "contains"

    USERS {
        uuid id PK
        text username UK
        text password_hash
        text name
        text role
        boolean is_active
        timestamptz created_at
    }

    CATEGORIES {
        uuid id PK
        text name UK
        timestamptz created_at
    }

    PRODUCTS {
        uuid id PK
        text name
        numeric price
        int stock_quantity
        uuid category_id FK
        text barcode UK
        text image_url
        boolean is_active
    }

    TRANSACTIONS {
        uuid id PK
        uuid cashier_id FK
        numeric total_amount
        numeric amount_received
        numeric change_amount
        text status
        uuid voided_by FK
        text voided_reason
        timestamptz voided_at
        timestamptz created_at
    }

    TRANSACTION_ITEMS {
        uuid id PK
        uuid transaction_id FK
        uuid product_id FK
        text product_name_snapshot
        numeric unit_price_snapshot
        int quantity
        numeric subtotal
    }

    STOCK_ADJUSTMENTS {
        uuid id PK
        uuid product_id FK
        uuid admin_id FK
        text adjustment_type
        int quantity
        text reason
        timestamptz created_at
    }
```

### 3.2 Design Notes

- **UUID primary keys** everywhere — avoids exposing sequential IDs, future-proofs for multi-outlet.
- **Snapshotting on `transaction_items`** — `product_name_snapshot`/`unit_price_snapshot` copied at sale time, so historical transactions stay accurate even if a product's price changes later.
- **Soft delete on `products`** (`is_active = false`) — historical transactions must keep referencing a valid row.
- **`transactions.status`** — `'completed'` or `'voided'`, never hard-deleted (audit trail).
- **`stock_adjustments` is append-only** — a log, not a mutable record.

### 3.3 Drizzle Schema

```ts
// lib/db/schema.ts
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "cashier"]);
export const transactionStatusEnum = pgEnum("transaction_status", [
  "completed",
  "voided",
]);
export const adjustmentTypeEnum = pgEnum("adjustment_type", [
  "increase",
  "decrease",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  barcode: text("barcode").unique(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  cashierId: uuid("cashier_id")
    .notNull()
    .references(() => users.id),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  amountReceived: numeric("amount_received", {
    precision: 12,
    scale: 2,
  }).notNull(),
  changeAmount: numeric("change_amount", { precision: 12, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("completed"),
  voidedBy: uuid("voided_by").references(() => users.id),
  voidedReason: text("voided_reason"),
  voidedAt: timestamp("voided_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const transactionItems = pgTable("transaction_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id")
    .notNull()
    .references(() => transactions.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  unitPriceSnapshot: numeric("unit_price_snapshot", {
    precision: 12,
    scale: 2,
  }).notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
});

export const stockAdjustments = pgTable("stock_adjustments", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => users.id),
  adjustmentType: adjustmentTypeEnum("adjustment_type").notNull(),
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

### 3.4 Indexes (MVP baseline)

Applied via a raw SQL migration (Drizzle doesn't yet have first-class syntax for `GIN`/full-text indexes, so these are added as a manual migration step):

```sql
CREATE INDEX idx_products_name        ON products USING GIN (to_tsvector('simple', name));
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active   ON products(is_active);

CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_cashier_id ON transactions(cashier_id);
CREATE INDEX idx_transactions_status     ON transactions(status);

CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id     ON transaction_items(product_id);

CREATE INDEX idx_stock_adjustments_product_id ON stock_adjustments(product_id);
```

> `barcode` and `username` already have implicit indexes from their `UNIQUE` constraints. Deeper index tuning (`EXPLAIN ANALYZE` before/after) is still planned for `ROADMAP.md` v1.1.

---

## 4. API Design

**Base path:** `/api/v1` (same-origin — the frontend and API are the same Next.js app, so no CORS configuration is needed for MVP)
**Auth:** JWT issued on login, stored in an `httpOnly`, `Secure` cookie. `middleware.ts` checks for the cookie's presence on protected routes; each Route Handler additionally verifies the JWT and role server-side (never trust the middleware alone for authorization — see Section 7).

**Standard response envelope (unchanged from v1.0):**

```json
// Success
{ "success": true, "data": { } }

// Error
{ "success": false, "error": { "code": "INSUFFICIENT_STOCK", "message": "Not enough stock for this product." } }
```

The full endpoint list (Auth, Users, Categories, Products, Transactions, Stock Adjustments, Dashboard) is **unchanged from `TECH_SPEC.md` v1.0, Section 4** — same paths, same methods, same roles. Only the implementation moved from Fiber handlers to Next.js Route Handlers. Refer to that table when building each `route.ts` file.

---

## 5. Critical Logic: Checkout (Atomicity & Concurrency)

```ts
// lib/services/transaction-service.ts
import { db } from "@/lib/db";
import { products, transactions, transactionItems } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { AppError } from "@/lib/app-error";

export async function checkout(
  cashierId: string,
  items: { productId: string; quantity: number }[],
  amountReceived: string,
) {
  return db.transaction(async (tx) => {
    let total = 0;
    const lineItems: (typeof transactionItems.$inferInsert)[] = [];

    for (const item of items) {
      // .for("update") issues SELECT ... FOR UPDATE, locking this product row
      // until commit/rollback — a concurrent checkout on the same product
      // must wait its turn.
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .for("update");

      if (!product || !product.isActive) {
        throw new AppError("NOT_FOUND", `Product ${item.productId} not found`);
      }
      if (product.stockQuantity < item.quantity) {
        throw new AppError(
          "INSUFFICIENT_STOCK",
          `Not enough stock for ${product.name}`,
        );
      }

      await tx
        .update(products)
        .set({
          stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
        })
        .where(eq(products.id, product.id));

      const subtotal = Number(product.price) * item.quantity;
      total += subtotal;

      lineItems.push({
        productId: product.id,
        productNameSnapshot: product.name,
        unitPriceSnapshot: product.price,
        quantity: item.quantity,
        subtotal: subtotal.toFixed(2),
      });
    }

    if (Number(amountReceived) < total) {
      throw new AppError("BAD_REQUEST", "Amount received is less than total");
    }

    const change = Number(amountReceived) - total;

    const [transaction] = await tx
      .insert(transactions)
      .values({
        cashierId,
        totalAmount: total.toFixed(2),
        amountReceived,
        changeAmount: change.toFixed(2),
        status: "completed",
      })
      .returning();

    await tx
      .insert(transactionItems)
      .values(
        lineItems.map((item) => ({ ...item, transactionId: transaction.id })),
      );

    return transaction;
  });
}
```

**Why `.for("update")` and not just a plain `UPDATE ... WHERE stock_quantity >= ?`:** both approaches prevent overselling, but explicit row locking is used deliberately because it makes the locking behavior visible and demonstrable — the same reasoning as the original Go/GORM design. `db.transaction()` automatically rolls back on any thrown error, including `AppError`. The tradeoff (lock contention under high concurrency) is still something to measure and discuss in the `v1.1` performance write-up.

**Manual concurrency test (do this — don't just trust the code):** fire two parallel `curl`/HTTP requests checking out the last unit of the same product and confirm exactly one succeeds and the other receives `INSUFFICIENT_STOCK`.

---

## 6. Route Handler Example

```ts
// app/api/v1/products/route.ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { ok, fail } from "@/lib/api-response";
import { searchProducts, createProduct } from "@/lib/services/product-service";
import { createProductSchema } from "@/lib/validators/product";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req); // throws AppError("UNAUTHORIZED") if no valid session
  const { searchParams } = new URL(req.url);

  const products = await searchProducts({
    query: searchParams.get("search") ?? "",
    categoryId: searchParams.get("category_id"),
    page: Number(searchParams.get("page") ?? "1"),
    limit: Number(searchParams.get("limit") ?? "20"),
  });

  return ok(products);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req, "admin"); // throws AppError("FORBIDDEN") if not admin
  const body = createProductSchema.parse(await req.json()); // zod validation

  const product = await createProduct(body);
  return ok(product, 201);
}
```

`requireAuth` centralizes exactly what the old Go `auth`/`role` middleware did — verify the JWT, load the user, and optionally assert a role — but is called explicitly inside each handler rather than wired as Fiber middleware. This is intentional: Next.js Route Handlers don't share a single middleware chain the way Fiber routes do, so auth checks live at the top of each handler instead.

---

## 7. Auth: `middleware.ts` + Session Helper

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/v1/auth/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)))
    return NextResponse.next();

  const session = req.cookies.get("session");
  if (!session) {
    return pathname.startsWith("/api")
      ? NextResponse.json(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Not authenticated" },
          },
          { status: 401 },
        )
      : NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

```ts
// lib/auth/session.ts
import { cookies } from "next/headers";
import { verifyJwt } from "./jwt";
import { AppError } from "@/lib/app-error";

export async function requireAuth(req: Request, role?: "admin" | "cashier") {
  const token = cookies().get("session")?.value;
  if (!token) throw new AppError("UNAUTHORIZED", "Not authenticated");

  const claims = verifyJwt(token); // throws AppError("UNAUTHORIZED") if invalid/expired
  if (role && claims.role !== role) {
    throw new AppError("FORBIDDEN", "Insufficient permissions");
  }
  return claims;
}
```

**Why both `middleware.ts` and per-handler `requireAuth`:** `middleware.ts` only checks that _a_ session cookie exists (cheap, runs on the Edge runtime, good for fast redirects). It cannot safely verify the JWT signature or check roles against the database in every case. **Actual authorization always happens in `requireAuth`, inside the handler.** Never rely on `middleware.ts` alone to protect an admin-only endpoint.

---

## 8. Error Handling Convention

_(Unchanged in spirit from v1.0 — same error taxonomy, now implemented as a TypeScript class instead of a Go error type.)_

```ts
// lib/app-error.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}
```

| Error code                        | HTTP Status | Example                                        |
| --------------------------------- | ----------- | ---------------------------------------------- |
| `BAD_REQUEST`                     | 400         | Invalid input, failed validation               |
| `UNAUTHORIZED`                    | 401         | Missing/invalid session                        |
| `FORBIDDEN`                       | 403         | Wrong role for this action                     |
| `NOT_FOUND`                       | 404         | Resource doesn't exist                         |
| `INSUFFICIENT_STOCK` / `CONFLICT` | 409         | Insufficient stock, duplicate username/barcode |
| `INTERNAL`                        | 500         | Unexpected/unhandled error                     |

A shared error-handling wrapper around each Route Handler catches `AppError` and formats the envelope automatically, so individual handlers just `throw` and don't manually pick status codes.

---

## 9. Environment Configuration

```env
# .env
DATABASE_URL=postgres://user:password@localhost:5432/brewpoint
JWT_SECRET=change-me-in-production
JWT_EXPIRY_HOURS=8
```

Only one `.env` is needed now (no separate frontend/backend env files) since it's one app. `DATABASE_URL` and `JWT_SECRET` never get a `NEXT_PUBLIC_` prefix — they must stay server-only and are only ever read inside Route Handlers/services, never in Client Components.

---

## 10. Dependencies (`package.json`)

| Package                  | Purpose                                                                      |
| ------------------------ | ---------------------------------------------------------------------------- |
| `next`                   | Framework (App Router + Route Handlers)                                      |
| `react`, `react-dom`     | UI library                                                                   |
| `typescript`             | Type safety                                                                  |
| `tailwindcss`            | Styling, required by shadcn/ui                                               |
| `shadcn/ui`              | Component primitives, added via CLI per component                            |
| `drizzle-orm`            | ORM / query builder                                                          |
| `drizzle-kit`            | Schema migrations (dev dependency)                                           |
| `postgres` (postgres.js) | PostgreSQL driver used by Drizzle                                            |
| `jose`                   | JWT signing/verification (Edge-runtime compatible, unlike `jsonwebtoken`)    |
| `bcryptjs`               | Password hashing (pure JS, works in more runtimes than native `bcrypt`)      |
| `zod`                    | Runtime schema validation — shared between Route Handlers and frontend forms |
| `react-hook-form`        | Form state management, paired with shadcn's `Form`                           |
| `zustand`                | Client state — cart contents, local UI state                                 |
| `@tanstack/react-query`  | Server state — fetching, caching, invalidation                               |
| `recharts`               | Dashboard charts                                                             |
| `date-fns`               | Date formatting/manipulation                                                 |

**Removed from v1.0:** everything Go-specific (`gofiber/fiber`, `gorm.io/gorm`, `golang-jwt`, `golang-migrate`, etc.) — no longer applicable.

---

## 11. Final Decisions Summary

| Component              | Decision                                                     | Reason                                                                                                   |
| ---------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Overall architecture   | Single Next.js app (Route Handlers as API)                   | Focus the learning curve on Next.js fullstack; see Section 1.2 for why this stays cheap to split later   |
| API layer              | Route Handlers mirroring a REST contract, not Server Actions | Keeps data access decoupled from components — the key enabler for a future Go backend split              |
| Database access        | Drizzle ORM + `postgres.js`                                  | SQL-visible query building, native row locking, full type inference, no codegen step                     |
| Migrations             | `drizzle-kit generate`/`migrate`                             | Schema-as-code with reviewable, generated SQL                                                            |
| Auth                   | JWT in `httpOnly` cookie, verified with `jose`               | Same approach as v1.0 — portable to a future Go service without changing the frontend's auth flow at all |
| Money type             | `NUMERIC` in Postgres, string-based decimal handling in TS   | Avoids floating-point rounding errors in financial calculations                                          |
| Primary keys           | UUID (`defaultRandom()`)                                     | No sequential ID leakage, future-proofs for multi-outlet                                                 |
| Product deletion       | Soft delete (`is_active`)                                    | Historical transactions must remain valid and queryable                                                  |
| Transaction line items | Snapshotted name/price                                       | Historical accuracy independent of later product edits                                                   |
| Concurrency control    | Drizzle `.for("update")`                                     | Explicit, demonstrable prevention of overselling under concurrent checkout                               |
| UI components          | shadcn/ui                                                    | Owned in-repo, themed with BrewPoint's color tokens                                                      |
| Frontend client state  | Zustand                                                      | Cart contents and local UI state                                                                         |
| Frontend server state  | TanStack Query                                               | Caching, refetching, invalidation against the Route Handler API                                          |

---

## 12. Future Enhancement: Splitting Out a Go Backend

Documented here so the intent is on record, not because it's needed yet — see `ROADMAP.md` for where this sits in the timeline.

When/if this happens, because of the Section 1.2 decision, the migration is:

1. Build a Go Fiber service replicating the exact same `/api/v1/**` contract (this original v1.0 spec, preserved in version control, becomes the reference).
2. Point the frontend's `API_BASE_URL` at the new Go service instead of `/api/v1` (same-origin relative path → absolute URL to the new host).
3. Delete the `app/api/v1` folder and the `lib/services`/`lib/db` layers from the Next.js app — the frontend becomes purely presentational, calling out to the Go API.
4. No changes needed to any React component, TanStack Query hook, or Zustand store — they were always calling an "API," they just didn't know it was in the same process.

---

_BrewPoint Technical Specification v2.0 — single Next.js app for MVP, structured to make a future Go backend split a configuration change, not a rewrite._
