# BrewPoint — Technical Specification

**Version:** 1.0 · **Stack:** Next.js + Go Fiber + PostgreSQL
**Status:** MVP Definition · **Companion docs:** `PRD.md`, `ROADMAP.md`

---

## 1. Architecture Overview

BrewPoint is a **decoupled fullstack application**: Next.js (frontend, separate service) talks to a Go Fiber REST API (backend, separate service) which is the only component with direct access to PostgreSQL.

```
[Browser]
    |
    v
[Next.js — App Router, Server/Client Components]
    |  (REST calls, JSON, JWT in httpOnly cookie)
    v
[Go Fiber API]
    |
    v
[Handler] -> [Service] -> [Repository] -> [PostgreSQL]
```

**Why this layering (Handler → Service → Repository):**

| Layer | Responsibility | Why it's separated |
|---|---|---|
| Handler | Parse request, call service, shape HTTP response | Keeps HTTP concerns (status codes, JSON) out of business logic |
| Service | Business rules (e.g. "checkout must be atomic," "cannot deactivate the last admin") | Testable without spinning up HTTP or a real DB |
| Repository | GORM queries against PostgreSQL | DB access is isolated — swappable, mockable in service-layer tests |

**Why GORM (instead of raw SQL):**

| Aspect | Raw SQL + `pgx` | GORM |
|---|---|---|
| Development speed | Every query hand-written | CRUD queries generated from struct methods — much faster to build the MVP |
| Learning value | Forces understanding of exact SQL | Still teaches relational modeling, but trades some SQL-level visibility for velocity — a deliberate tradeoff for this project |
| Row locking (`SELECT ... FOR UPDATE`) | Explicit but verbose | Available via `clause.Locking{Strength: "UPDATE"}` — still explicit in code, just less boilerplate |
| Migration control | Fully manual, versioned | `AutoMigrate` for iteration speed during development; explicit versioned migrations (`golang-migrate`) still used for the initial schema and any production-sensitive changes |
| Raw SQL escape hatch | N/A | GORM allows `.Raw()` / `.Exec()` for any query that's clearer as plain SQL (e.g. full-text search, complex aggregates) |

**Decision: Go Fiber + GORM (`gorm.io/gorm` with `gorm.io/driver/postgres`).** Query performance and indexing are still verified with `EXPLAIN ANALYZE` where it matters (see `ROADMAP.md` v1.1) — GORM doesn't remove that discipline, it just removes repetitive boilerplate for standard CRUD.

---

## 2. Repository Structure

### 2.1 Backend (`/backend`)

```
backend/
├── cmd/
│   └── api/
│       └── main.go                    # entrypoint: load config, connect DB, start Fiber
│
├── internal/
│   ├── config/
│   │   └── config.go                  # env var loading
│   │
│   ├── database/
│   │   ├── postgres.go                # pgxpool connection setup
│   │   └── migrations/
│   │       ├── 000001_init_schema.up.sql
│   │       └── 000001_init_schema.down.sql
│   │
│   ├── middleware/
│   │   ├── auth.go                    # verifies JWT, sets user context
│   │   ├── role.go                    # requireRole("admin") guard
│   │   └── logger.go                  # structured request logging
│   │
│   ├── auth/
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── jwt.go
│   │
│   ├── user/
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   │
│   ├── category/
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   │
│   ├── product/
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   │
│   ├── transaction/
│   │   ├── handler.go
│   │   ├── service.go                 # checkout + void logic lives here
│   │   ├── repository.go
│   │   └── model.go
│   │
│   ├── stockadjustment/
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── model.go
│   │
│   ├── dashboard/
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── repository.go
│   │
│   └── router/
│       └── router.go                  # wires all routes + middleware
│
├── pkg/
│   ├── response/
│   │   └── response.go                # standard API response envelope
│   └── apperror/
│       └── apperror.go                # typed application errors -> HTTP status mapping
│
├── go.mod
└── go.sum
```

### 2.2 Frontend (`/frontend`)

```
frontend/
├── app/
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── (staff)/                       # route group, protected by middleware.ts
│   │   ├── layout.tsx                 # shell: sidebar/nav, session check
│   │   ├── pos/
│   │   │   └── page.tsx               # cashier checkout screen
│   │   ├── dashboard/
│   │   │   └── page.tsx               # admin only
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx               # admin only
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── stock-adjustments/
│   │       └── page.tsx
│   │
│   └── layout.tsx                     # root layout
│
├── components/
│   ├── ui/                            # shadcn/ui primitives (button, input, dialog, table, form...)
│   │                                   # generated via `npx shadcn add <component>`, owned in-repo
│   ├── pos/
│   │   ├── product-grid.tsx
│   │   ├── cart.tsx
│   │   └── checkout-modal.tsx
│   ├── products/
│   │   └── product-form.tsx
│   └── dashboard/
│       ├── summary-cards.tsx
│       └── best-sellers-list.tsx
│
├── lib/
│   ├── api-client.ts                  # fetch wrapper, base URL, error handling
│   ├── query-client.ts                # TanStack Query client + provider setup
│   ├── auth.ts                        # session helpers
│   └── types.ts                       # shared TS types mirroring API responses
│
├── stores/
│   └── cart-store.ts                  # Zustand store: cart items, add/remove/update qty/clear
│
├── hooks/
│   ├── use-products.ts                # TanStack Query hooks wrapping product endpoints
│   └── use-transactions.ts            # TanStack Query hooks wrapping transaction endpoints
│
├── middleware.ts                      # redirects unauthenticated/unauthorized requests
├── package.json
└── tsconfig.json
```

---

## 3. Database Design

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
        timestamptz updated_at
    }

    CATEGORIES {
        uuid id PK
        text name UK
        timestamptz created_at
        timestamptz updated_at
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
        timestamptz created_at
        timestamptz updated_at
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

- **UUID primary keys** everywhere (generated via `gen_random_uuid()`, `pgcrypto` extension) instead of auto-increment integers — avoids exposing sequential IDs in the API and makes future multi-outlet sharding easier if `v2.0` ever happens.
- **Snapshotting on `transaction_items`:** `product_name_snapshot` and `unit_price_snapshot` are copied at the moment of sale, not joined live from `products`. This is deliberate — if a product's price or name changes later, historical transactions must still reflect what was actually charged at the time.
- **Soft delete on `products`:** `is_active = false` instead of a hard `DELETE`, since `transaction_items.product_id` must keep referencing a valid row for historical transactions to remain queryable.
- **`transactions.status`** is an enum-like text field: `'completed'` or `'voided'`. Voiding never deletes a transaction — it's an audit trail.
- **`stock_adjustments` is append-only** — it is a log, not a mutable record. There's no update/delete endpoint for it, only insert and read (see PRD Feature 7).

### 3.3 DDL (PostgreSQL)

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    name            TEXT NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    price           NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock_quantity  INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category_id     UUID NOT NULL REFERENCES categories(id),
    barcode         TEXT UNIQUE,
    image_url       TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cashier_id          UUID NOT NULL REFERENCES users(id),
    total_amount        NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    amount_received     NUMERIC(12, 2) NOT NULL CHECK (amount_received >= 0),
    change_amount       NUMERIC(12, 2) NOT NULL CHECK (change_amount >= 0),
    status              TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'voided')),
    voided_by           UUID REFERENCES users(id),
    voided_reason       TEXT,
    voided_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transaction_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id          UUID NOT NULL REFERENCES transactions(id),
    product_id              UUID NOT NULL REFERENCES products(id),
    product_name_snapshot   TEXT NOT NULL,
    unit_price_snapshot     NUMERIC(12, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
    quantity                INT NOT NULL CHECK (quantity > 0),
    subtotal                NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

CREATE TABLE stock_adjustments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID NOT NULL REFERENCES products(id),
    admin_id            UUID NOT NULL REFERENCES users(id),
    adjustment_type     TEXT NOT NULL CHECK (adjustment_type IN ('increase', 'decrease')),
    quantity            INT NOT NULL CHECK (quantity > 0),
    reason              TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.4 Indexes (MVP baseline)

These are the indexes required for the MVP's own query patterns (search, filters) — separate from the deeper performance tuning pass planned in `ROADMAP.md` v1.1.

```sql
-- Product search & filtering
CREATE INDEX idx_products_name        ON products USING GIN (to_tsvector('simple', name));
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active   ON products(is_active);

-- Transaction filtering (date range, cashier)
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_cashier_id ON transactions(cashier_id);
CREATE INDEX idx_transactions_status     ON transactions(status);

-- Transaction items lookup
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id     ON transaction_items(product_id);

-- Stock adjustment history per product
CREATE INDEX idx_stock_adjustments_product_id ON stock_adjustments(product_id);
```

> `barcode` and `username` already have implicit indexes from their `UNIQUE` constraints — no separate index needed.
> Query plan verification (`EXPLAIN ANALYZE` before/after) and additional composite indexes are covered in `ROADMAP.md` v1.1, once real usage patterns can be observed.

---

## 4. API Design

**Base URL:** `/api/v1`
**Auth:** JWT issued on login, stored in an `httpOnly`, `Secure` cookie. The Fiber `auth` middleware reads and verifies it on every protected route; the `role` middleware further restricts admin-only routes.

**Standard response envelope:**

```json
// Success
{
  "success": true,
  "data": { }
}

// Error
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Not enough stock for this product."
  }
}
```

### 4.1 Auth

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Authenticate, set session cookie |
| POST | `/auth/logout` | Any | Clear session cookie |
| GET | `/auth/me` | Any | Return current logged-in user |

### 4.2 Users

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/users` | Admin | Create a staff account |
| GET | `/users` | Admin | List all staff accounts |
| GET | `/users/:id` | Admin | Get a staff account's detail |
| PATCH | `/users/:id` | Admin | Update name/role/active status |
| PATCH | `/users/:id/reset-password` | Admin | Reset a staff member's password |

### 4.3 Categories

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/categories` | Admin | Create a category |
| GET | `/categories` | Any | List all categories |
| GET | `/categories/:id` | Any | Get category detail |
| PATCH | `/categories/:id` | Admin | Rename a category |
| DELETE | `/categories/:id` | Admin | Delete a category (blocked if products reference it) |

### 4.4 Products

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/products` | Admin | Create a product |
| GET | `/products` | Any | List products — query: `search`, `category_id`, `page`, `limit` |
| GET | `/products/:id` | Any | Get product detail |
| PATCH | `/products/:id` | Admin | Update a product |
| DELETE | `/products/:id` | Admin | Soft-delete a product |

### 4.5 Transactions (Point of Sale)

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/transactions` | Cashier, Admin | Checkout — creates transaction, items, deducts stock |
| GET | `/transactions` | Any | List transactions — query: `date_from`, `date_to`, `cashier_id` |
| GET | `/transactions/:id` | Any | Get transaction detail |
| PATCH | `/transactions/:id/void` | Admin | Void a transaction, restore stock |

### 4.6 Stock Adjustments

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/products/:id/stock-adjustments` | Admin | Adjust a product's stock with a reason |
| GET | `/products/:id/stock-adjustments` | Admin | View adjustment history for a product |

### 4.7 Dashboard

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/dashboard/summary` | Admin | Total sales + transaction count — query: `date_from`, `date_to` |
| GET | `/dashboard/best-sellers` | Admin | Best-selling products — query: `date_from`, `date_to` |

---

## 5. Critical Logic: Checkout (Atomicity & Concurrency)

Checkout is the single most correctness-sensitive operation in BrewPoint — it must never allow overselling when two cashiers check out the same product at the same time. This is done with a Postgres transaction plus row-level locking.

```go
// internal/transaction/service.go

func (s *Service) Checkout(ctx context.Context, cashierID uuid.UUID, items []CheckoutItem, amountReceived decimal.Decimal) (*Transaction, error) {
	var transaction Transaction

	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var total decimal.Decimal
		var lineItems []TransactionItem

		for _, item := range items {
			var product Product

			// Clauses(clause.Locking{Strength: "UPDATE"}) issues SELECT ... FOR UPDATE,
			// locking this product row until commit/rollback, so a concurrent
			// checkout on the same product must wait its turn.
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
				Where("id = ? AND is_active = ?", item.ProductID, true).
				First(&product).Error; err != nil {
				return apperror.NotFound("product not found")
			}

			if product.StockQuantity < item.Quantity {
				return apperror.Conflict("INSUFFICIENT_STOCK", fmt.Sprintf("not enough stock for %s", product.Name))
			}

			if err := tx.Model(&product).
				Update("stock_quantity", gorm.Expr("stock_quantity - ?", item.Quantity)).Error; err != nil {
				return err
			}

			subtotal := product.Price.Mul(decimal.NewFromInt(int64(item.Quantity)))
			total = total.Add(subtotal)

			lineItems = append(lineItems, TransactionItem{
				ProductID:           product.ID,
				ProductNameSnapshot: product.Name,
				UnitPriceSnapshot:   product.Price,
				Quantity:            item.Quantity,
				Subtotal:            subtotal,
			})
		}

		if amountReceived.LessThan(total) {
			return apperror.BadRequest("amount received is less than total")
		}

		transaction = Transaction{
			CashierID:      cashierID,
			TotalAmount:    total,
			AmountReceived: amountReceived,
			ChangeAmount:   amountReceived.Sub(total),
			Status:         "completed",
			Items:          lineItems,
		}

		// GORM inserts the transaction and its associated TransactionItems
		// together via the Items association.
		return tx.Create(&transaction).Error
	})

	if err != nil {
		return nil, err
	}
	return &transaction, nil
}
```

**Why `Clauses(clause.Locking{Strength: "UPDATE"})` and not just a plain `UPDATE ... WHERE stock_quantity >= ?`:** both approaches prevent overselling, but explicit row locking is used here deliberately because it makes the locking behavior visible and easy to reason about/demonstrate — which matters for a learning-focused portfolio project. GORM's `.Transaction()` wraps the whole block in `BEGIN`/`COMMIT`/`ROLLBACK` automatically, including rollback on panic. The tradeoff (lock contention under high concurrency) is intentionally left as something to measure and discuss in the `v1.1` performance write-up.

---

## 6. Repository Layer Example

```go
// internal/product/model.go

type Product struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name          string
	Price         decimal.Decimal `gorm:"type:numeric(12,2)"`
	StockQuantity int
	CategoryID    uuid.UUID
	Barcode       *string
	ImageURL      *string
	IsActive      bool `gorm:"default:true"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// internal/product/repository.go

type Repository struct {
	db *gorm.DB
}

func (r *Repository) Search(ctx context.Context, query string, categoryID *uuid.UUID, page, limit int) ([]Product, error) {
	tx := r.db.WithContext(ctx).
		Where("is_active = ?", true)

	if query != "" {
		// .Raw()/clause escape hatch: full-text search is clearer as plain SQL
		// than forcing it through GORM's query builder.
		tx = tx.Where(
			"to_tsvector('simple', name) @@ plainto_tsquery('simple', ?) OR barcode = ?",
			query, query,
		)
	}
	if categoryID != nil {
		tx = tx.Where("category_id = ?", *categoryID)
	}

	var products []Product
	err := tx.Order("name ASC").
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&products).Error

	return products, err
}
```

---

## 7. Auth Middleware

```go
// internal/middleware/auth.go

func Auth(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Cookies("session")
		if tokenString == "" {
			return apperror.Unauthorized("not authenticated").ToFiberResponse(c)
		}

		claims, err := auth.VerifyToken(tokenString, jwtSecret)
		if err != nil {
			return apperror.Unauthorized("invalid or expired session").ToFiberResponse(c)
		}

		c.Locals("userID", claims.UserID)
		c.Locals("role", claims.Role)
		return c.Next()
	}
}

// internal/middleware/role.go

func RequireRole(role string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if c.Locals("role") != role {
			return apperror.Forbidden("insufficient permissions").ToFiberResponse(c)
		}
		return c.Next()
	}
}
```

---

## 8. Error Handling Convention

Application errors are typed in `pkg/apperror` and mapped once to HTTP status codes, so handlers never manually choose status codes:

| Error type | HTTP Status | Example |
|---|---|---|
| `BadRequest` | 400 | Invalid input, failed validation |
| `Unauthorized` | 401 | Missing/invalid session |
| `Forbidden` | 403 | Wrong role for this action |
| `NotFound` | 404 | Resource doesn't exist |
| `Conflict` | 409 | Insufficient stock, duplicate username/barcode |
| `Internal` | 500 | Unexpected/unhandled error |

All errors returned to the client follow the standard envelope shown in Section 4, with a machine-readable `code` (e.g. `INSUFFICIENT_STOCK`) the frontend can branch on, plus a human-readable `message`.

---

## 9. Environment Configuration

```env
# backend/.env
PORT=8080
DATABASE_URL=postgres://user:password@localhost:5432/brewpoint?sslmode=disable
JWT_SECRET=change-me-in-production
JWT_EXPIRY_HOURS=8
CORS_ALLOWED_ORIGIN=http://localhost:3000
```

```env
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Separate `.env` files are maintained per environment (local, staging, production) as noted in `ROADMAP.md` v1.0.

---

## 10. Dependencies

### 10.1 Backend (`go.mod`)

| Package | Purpose |
|---|---|
| `github.com/gofiber/fiber/v2` | HTTP framework |
| `gorm.io/gorm` | ORM — models, queries, migrations, transactions |
| `gorm.io/driver/postgres` | GORM's PostgreSQL driver (built on `pgx` under the hood) |
| `github.com/golang-jwt/jwt/v5` | JWT issuing and verification |
| `golang.org/x/crypto/bcrypt` | Password hashing |
| `github.com/golang-migrate/migrate/v4` | Versioned SQL migrations for the initial schema (GORM `AutoMigrate` used for fast local iteration only) |
| `github.com/google/uuid` | UUID generation (application-side, where needed) |
| `github.com/shopspring/decimal` | Precise decimal arithmetic for money — avoids float rounding errors |
| `github.com/joho/godotenv` | Load `.env` in local development |

### 10.2 Frontend (`package.json`)

| Package | Purpose |
|---|---|
| `next` | Framework (App Router) |
| `react`, `react-dom` | UI library |
| `typescript` | Type safety |
| `tailwindcss` | Styling, required by shadcn/ui |
| `shadcn/ui` | Accessible, unstyled-by-default component primitives (button, dialog, table, form, etc.) copied into the repo and themed with our color tokens — not an npm dependency in the traditional sense, added via the `shadcn` CLI per component |
| `zustand` | Client state — cart contents, UI state (modals, filters) |
| `@tanstack/react-query` | Server state — fetching, caching, and invalidating data from the Go API (products, transactions, dashboard) |
| `zod` | Runtime schema validation for forms and API responses |
| `react-hook-form` | Form state management, paired with shadcn's `Form` component |
| `recharts` | Dashboard charts (also what shadcn's chart components are built on) |
| `date-fns` | Date formatting/manipulation |

---

## 11. Final Decisions Summary

| Component | Decision | Reason |
|---|---|---|
| Backend framework | Go Fiber | Fast, minimal, familiar Express-like API, good middleware ecosystem |
| Database access | GORM (`gorm.io/gorm` + `gorm.io/driver/postgres`) | Faster CRUD development than raw SQL, while still allowing explicit row locking and raw `.Raw()`/`.Exec()` queries where precision matters |
| Migrations | `golang-migrate` for the initial schema; GORM `AutoMigrate` for fast local iteration | Balances explicit, reviewable schema history with development speed |
| Auth | JWT in `httpOnly` cookie | Avoids storing tokens in `localStorage` (XSS-exposed); works cleanly with Next.js middleware |
| Money type | `NUMERIC` in Postgres, `decimal.Decimal` in Go | Avoids floating-point rounding errors in financial calculations |
| Primary keys | UUID (`gen_random_uuid()`) | No sequential ID leakage, future-proofs for multi-outlet |
| Product deletion | Soft delete (`is_active`) | Historical transactions must remain valid and queryable |
| Transaction line items | Snapshotted name/price | Historical accuracy independent of later product edits |
| Concurrency control | GORM `Clauses(clause.Locking{Strength: "UPDATE"})` | Explicit, demonstrable prevention of overselling under concurrent checkout |
| UI components | shadcn/ui | Accessible primitives owned directly in the codebase (not a black-box npm package), easy to theme with BrewPoint's color tokens |
| Frontend client state | Zustand | Cart contents and local UI state — minimal boilerplate |
| Frontend server state | TanStack Query | Caching, refetching, and invalidation for data from the Go API — mirrors the caching discipline planned server-side in `ROADMAP.md` v1.1 |

---

*BrewPoint Technical Specification v1.0 — ready to serve as the implementation baseline for `ROADMAP.md` Phase 0 onward.*
