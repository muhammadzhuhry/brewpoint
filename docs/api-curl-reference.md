# BrewPoint API — curl Reference for Postman

One `curl` command per case, grouped by module. Paste each into Postman via **Import → raw text** (or paste directly into a new request's address bar — Postman auto-parses a pasted curl command into a request). Cookies are handled automatically by Postman's built-in cookie jar once you run the login request in the same collection — you don't need `-c`/`-b` flags like in a terminal.

**Before you start:**

- Set a collection variable `baseUrl` = `http://localhost:3000` (or just replace `{{baseUrl}}` with that literal in every command below if you don't want to bother with variables).
- Several commands below reference `{{categoryId}}`, `{{productId}}`, `{{userId}}`, `{{transactionId}}` — these don't exist yet. Run the corresponding "create"/"list" request first, copy a real `id` out of the response, and either save it as a collection variable or just paste it in place of the placeholder for that request.
- Run requests in the order they're listed within each module — later ones often depend on IDs created earlier.

Expected results reference `TECH_SPEC.md` §8's error taxonomy: `BAD_REQUEST`→400, `UNAUTHORIZED`→401, `FORBIDDEN`→403, `NOT_FOUND`→404, `INSUFFICIENT_STOCK`/`CONFLICT`→409, `INTERNAL`→500.

---

## 1. Auth

### 1.1 Login — success

Expected: `200`, `{ success: true, data: { id, username, name, role } }`, sets a `session` cookie.

```bash
curl -X POST {{baseUrl}}/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 1.2 Login — wrong password

Expected: `401`, `code: "UNAUTHORIZED"`.

```bash
curl -X POST {{baseUrl}}/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong-password"}'
```

### 1.3 Login — missing fields

Expected: `400`, `code: "BAD_REQUEST"`.

```bash
curl -X POST {{baseUrl}}/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin"}'
```

### 1.4 Me — while logged in

Run 1.1 first in the same Postman session. Expected: `200`, `{ data: { userId, username, name, role } }`.

```bash
curl {{baseUrl}}/api/v1/auth/me
```

### 1.5 Me — without logging in (new/incognito Postman session, or after 1.6)

Expected: `401`, `code: "UNAUTHORIZED"`.

```bash
curl {{baseUrl}}/api/v1/auth/me
```

### 1.6 Logout

Expected: `200`, `{ data: { message: "Logged out." } }`, clears the `session` cookie. Re-running 1.4 after this should now behave like 1.5.

```bash
curl -X POST {{baseUrl}}/api/v1/auth/logout
```

---

## 2. Users (admin only, every endpoint)

Log in as admin (1.1) before all of these.

### 2.1 List users

Expected: `200`, array of users.

```bash
curl {{baseUrl}}/api/v1/users
```

### 2.2 Create user — success

Expected: `201`, created user object. Copy the `id` from the response as `{{userId}}` for the requests below.

```bash
curl -X POST {{baseUrl}}/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"username":"cashier2","password":"cashier123","name":"Second Cashier","role":"cashier"}'
```

### 2.3 Create user — duplicate username

Run 2.2 twice with the same username. Expected: `409`, `code: "CONFLICT"`.

### 2.4 Create user — invalid role

Expected: `400`, `code: "BAD_REQUEST"` (zod rejects anything outside `"admin"`/`"cashier"`).

```bash
curl -X POST {{baseUrl}}/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"username":"badrole","password":"cashier123","name":"Bad Role","role":"manager"}'
```

### 2.5 Update user

Expected: `200`, updated user object.

```bash
curl -X PUT {{baseUrl}}/api/v1/users/{{userId}} \
  -H "Content-Type: application/json" \
  -d '{"username":"cashier2","name":"Second Cashier Renamed","role":"cashier"}'
```

### 2.6 Reset password

Expected: `200`, updated user object (no password fields exposed differently than update — check `lib/services/user-service.ts` if unsure what comes back).

```bash
curl -X POST {{baseUrl}}/api/v1/users/{{userId}}/reset-password \
  -H "Content-Type: application/json" \
  -d '{"password":"newpassword123"}'
```

### 2.7 Deactivate user — success

Expected: `200`, `isActive: false`.

```bash
curl -X PATCH {{baseUrl}}/api/v1/users/{{userId}} \
  -H "Content-Type: application/json" \
  -d '{"isActive":false}'
```

### 2.8 Deactivate the last active admin — should be blocked

Try this against the seeded `admin` user's id, **only if it's the sole active admin** in your database. Expected: `400`/`409` (check `lib/services/user-service.ts` for the exact code `setUserActive` throws) — not a `200`.

```bash
curl -X PATCH {{baseUrl}}/api/v1/users/<ADMIN_USER_ID> \
  -H "Content-Type: application/json" \
  -d '{"isActive":false}'
```

### 2.9 Any users endpoint as cashier — should be forbidden

Log in as a cashier (e.g. `cashier1`/`cashier123` if you created one earlier) in a second Postman session/tab, then:

Expected: `403`, `code: "FORBIDDEN"`.

```bash
curl {{baseUrl}}/api/v1/users
```

---

## 3. Categories

Log in as admin.

### 3.1 List categories

Expected: `200`, array. Any authenticated user (admin or cashier) can do this — not admin-gated.

```bash
curl {{baseUrl}}/api/v1/categories
```

### 3.2 Create category — success

Expected: `201`. Copy `id` as `{{categoryId}}`.

```bash
curl -X POST {{baseUrl}}/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Non-Coffee"}'
```

### 3.3 Create category — duplicate name

Run 3.2 again with the same name. Expected: `409`, `code: "CONFLICT"`.

### 3.4 Update category

Expected: `200`.

```bash
curl -X PUT {{baseUrl}}/api/v1/categories/{{categoryId}} \
  -H "Content-Type: application/json" \
  -d '{"name":"Non-Coffee Drinks"}'
```

### 3.5 Delete category — blocked because a product references it

First create a product in this category (see 4.2), then try deleting the category. Expected: `409`, `code: "CONFLICT"`.

```bash
curl -X DELETE {{baseUrl}}/api/v1/categories/{{categoryId}}
```

### 3.6 Delete category — success (no products reference it)

Create a throwaway category with no products, then delete it. Expected: `200`.

### 3.7 Create/Update/Delete as cashier — should be forbidden

Expected: `403` on POST/PUT/DELETE; `200` still works on GET (3.1) as cashier.

---

## 4. Products

Log in as admin unless noted.

### 4.1 List/search products

Expected: `200`, `{ items, total, page, pageSize }`. Try with and without query params.

```bash
curl "{{baseUrl}}/api/v1/products"
curl "{{baseUrl}}/api/v1/products?search=latte"
curl "{{baseUrl}}/api/v1/products?categoryId={{categoryId}}"
curl "{{baseUrl}}/api/v1/products?page=1"
```

### 4.2 Create product — success

Expected: `201`. Copy `id` as `{{productId}}`.

```bash
curl -X POST {{baseUrl}}/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Hot Chocolate","categoryId":"{{categoryId}}","price":"4.50","stockQuantity":25,"barcode":"7850099999"}'
```

### 4.3 Create product — duplicate barcode

Run 4.2 again with the same `barcode`. Expected: `409`, `code: "CONFLICT"`.

### 4.4 Create product — nonexistent category

Expected: `404`, `code: "NOT_FOUND"` (from `getCategoryById` inside `createProduct`).

```bash
curl -X POST {{baseUrl}}/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Ghost Product","categoryId":"00000000-0000-0000-0000-000000000000","price":"1.00","stockQuantity":1}'
```

### 4.5 Update product

Expected: `200`.

```bash
curl -X PUT {{baseUrl}}/api/v1/products/{{productId}} \
  -H "Content-Type: application/json" \
  -d '{"name":"Hot Chocolate","categoryId":"{{categoryId}}","price":"4.75","stockQuantity":25,"barcode":"7850099999"}'
```

### 4.6 Delete product — hard delete (never sold)

Use a freshly created product with no transactions against it. Expected: `200`, row actually gone (check with 4.1 afterward — it should no longer appear).

```bash
curl -X DELETE {{baseUrl}}/api/v1/products/{{productId}}
```

### 4.7 Delete product — soft delete (already sold at least once)

Checkout this product first (see 5.1), then delete it. Expected: `200`, but `isActive: false` in the DB rather than a removed row (won't appear in 4.1's search, since that filters `isActive = true`).

### 4.8 Create/Update/Delete as cashier — should be forbidden

Expected: `403`. GET (4.1) still works as cashier.

---

## 5. Transactions

### 5.1 Checkout — success (as cashier or admin)

Expected: `201`, transaction object with `status: "completed"`. Copy `id` as `{{transactionId}}`.

```bash
curl -X POST {{baseUrl}}/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"{{productId}}","quantity":1}],"amountReceived":"10.00"}'
```

### 5.2 Checkout — insufficient stock

Pick a `quantity` larger than the product's current `stockQuantity` (check via 4.1 first). Expected: `409`, `code: "INSUFFICIENT_STOCK"`.

### 5.3 Checkout — amount received less than total

Expected: `400`, `code: "BAD_REQUEST"`.

```bash
curl -X POST {{baseUrl}}/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"{{productId}}","quantity":1}],"amountReceived":"0.01"}'
```

### 5.4 Checkout — nonexistent product

Expected: `404`, `code: "NOT_FOUND"`.

```bash
curl -X POST {{baseUrl}}/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"00000000-0000-0000-0000-000000000000","quantity":1}],"amountReceived":"10.00"}'
```

### 5.5 List transactions — as admin (sees all) vs as cashier (own only)

Expected: `200` for both, but the cashier's `items` should only include transactions where `cashierId` is their own — even if you pass `?cashierId=` for someone else, it's ignored server-side for non-admins.

```bash
curl {{baseUrl}}/api/v1/transactions
curl "{{baseUrl}}/api/v1/transactions?status=completed"
```

### 5.6 Get transaction by id — own vs another cashier's

Log in as `cashier1`, note a `transactionId` that belongs to a *different* cashier (e.g. one admin created in 5.1), then:

Expected: `403`, `code: "FORBIDDEN"`.

```bash
curl {{baseUrl}}/api/v1/transactions/{{transactionId}}
```

### 5.7 Void — success (admin only)

Expected: `200`, `status: "voided"`, stock restored (confirm via 4.1).

```bash
curl -X POST {{baseUrl}}/api/v1/transactions/{{transactionId}}/void \
  -H "Content-Type: application/json" \
  -d '{"reason":"Customer changed their mind"}'
```

### 5.8 Void — already voided

Run 5.7 again on the same `{{transactionId}}`. Expected: `409`, `code: "CONFLICT"`.

### 5.9 Void — as cashier

Expected: `403`, `code: "FORBIDDEN"`.

### 5.10 Void — missing reason

Expected: `400`, `code: "BAD_REQUEST"`.

```bash
curl -X POST {{baseUrl}}/api/v1/transactions/{{transactionId}}/void \
  -H "Content-Type: application/json" \
  -d '{"reason":""}'
```

---

## 6. Stock Adjustments (admin only, every endpoint)

Log in as admin.

### 6.1 Create adjustment — increase

Expected: `201`, adjustment object.

```bash
curl -X POST {{baseUrl}}/api/v1/products/{{productId}}/stock-adjustments \
  -H "Content-Type: application/json" \
  -d '{"adjustmentType":"increase","quantity":10,"reason":"Restock from supplier"}'
```

### 6.2 Create adjustment — decrease within available stock

Check current `stockQuantity` via 4.1 first, pick a smaller `quantity`. Expected: `201`.

```bash
curl -X POST {{baseUrl}}/api/v1/products/{{productId}}/stock-adjustments \
  -H "Content-Type: application/json" \
  -d '{"adjustmentType":"decrease","quantity":5,"reason":"Damaged in storage"}'
```

### 6.3 Create adjustment — decrease past available stock (should be rejected, not clamped)

Pick a `quantity` larger than current stock. Expected: `400`, `code: "BAD_REQUEST"`. Then re-check 4.1 — `stockQuantity` must be **unchanged**, proving it wasn't silently clamped to 0.

```bash
curl -X POST {{baseUrl}}/api/v1/products/{{productId}}/stock-adjustments \
  -H "Content-Type: application/json" \
  -d '{"adjustmentType":"decrease","quantity":999999,"reason":"Testing the reject-not-clamp rule"}'
```

### 6.4 View adjustment history

Expected: `200`, array ordered newest-first — should show 6.1 and 6.2, not 6.3 (since 6.3 was rejected before any insert happened).

```bash
curl {{baseUrl}}/api/v1/products/{{productId}}/stock-adjustments
```

### 6.5 Nonexistent product

Expected: `404`, `code: "NOT_FOUND"`.

```bash
curl -X POST {{baseUrl}}/api/v1/products/00000000-0000-0000-0000-000000000000/stock-adjustments \
  -H "Content-Type: application/json" \
  -d '{"adjustmentType":"increase","quantity":1,"reason":"test"}'
```

### 6.6 As cashier — should be forbidden

Expected: `403` on both GET and POST.

---

## 7. Dashboard (admin only, every endpoint)

Log in as admin.

### 7.1 Sales summary — default (today)

Expected: `200`, `{ totalSales, transactionCount }`.

```bash
curl {{baseUrl}}/api/v1/dashboard/summary
```

### 7.2 Sales summary — explicit date range

Expected: `200`.

```bash
curl "{{baseUrl}}/api/v1/dashboard/summary?from=2026-01-01&to=2026-12-31"
```

### 7.3 Best sellers — default

Expected: `200`, array ranked by quantity descending.

```bash
curl {{baseUrl}}/api/v1/dashboard/best-sellers
```

### 7.4 Best sellers — with limit

Expected: `200`, array length ≤ `limit`.

```bash
curl "{{baseUrl}}/api/v1/dashboard/best-sellers?limit=3"
```

### 7.5 As cashier — should be forbidden

Expected: `403` on both endpoints.

### 7.6 Without logging in at all — should be unauthorized

Log out (1.6) first. Expected: `401`, `code: "UNAUTHORIZED"`.
