# Product Requirements Document: BrewPoint

## Product Overview

**Product Vision:**
BrewPoint is a web-based Point of Sale (POS) system built for single-outlet coffee shops. It helps store staff manage products, process transactions quickly at the counter, and gives owners visibility into daily sales — without the complexity or cost of enterprise POS software.

**Target Users:**
The "user" throughout this document refers to **internal staff who operate the POS system** (store admin/owner and cashiers) — **not** the end customer who buys coffee. BrewPoint has no customer-facing interface in v1.

- **Primary:** Cashiers who need a fast, low-friction way to process orders at the counter.
- **Secondary:** Store admins/owners who need to manage products and check sales performance.

**Business Objectives:**

- Provide a functional, reliable POS for a single coffee shop outlet.
- Keep the system simple enough to operate without staff training beyond a few minutes.
- Build a system architecture that can be incrementally enhanced (performance, scalability, security) after MVP without major rewrites.
- Serve as a credible, demo-able portfolio project showing real-world fullstack engineering practices.

**Success Metrics:**

- A transaction can be completed end-to-end (select product → checkout → stock updated → receipt shown) in under 30 seconds.
- Zero stock discrepancies caused by concurrent checkouts.
- Admin can retrieve daily sales totals without manual calculation.
- System stays usable with zero unhandled errors during a full day of simulated store operation.

---

## User Personas

### Persona 1: Store Admin / Owner

- **Role:** Manages the store's product catalog, staff accounts, and reviews sales performance.
- **Technical Proficiency:** Low to moderate — comfortable with basic web apps, not a developer.
- **Goals:** Keep the product catalog accurate, monitor daily/periodic sales, manage which staff can access the system.
- **Pain Points:** Manual bookkeeping is error-prone; needs to trust that stock numbers and sales totals are accurate.
- **User Journey:** Logs in → manages products/categories → reviews sales dashboard → manages staff accounts as needed.

### Persona 2: Cashier

- **Role:** Operates the POS at the counter, processes customer orders.
- **Technical Proficiency:** Low — needs a system that is fast and requires minimal clicks per transaction.
- **Goals:** Complete each transaction quickly and accurately, minimize input errors during rush hour.
- **Pain Points:** Slow systems create queues; complicated UI causes mistakes under pressure.
- **User Journey:** Logs in → searches/selects products → builds a cart → checks out → views/confirms receipt → repeats for next customer.

---

## Product Requirements

### Core Constraints

- Frontend: Next.js (web application, desktop/tablet browser — no native mobile app in v1).
- Backend: Go Fiber, exposed as a REST API consumed by the frontend.
- Database: PostgreSQL.
- Single-outlet only in v1 — no multi-branch or multi-tenant support.
- No customer-facing app, loyalty program, or online ordering in v1.
- No payment gateway integration in v1 — payment is recorded manually (cash or "other," with amount received and change calculated by the system).
- No physical receipt printing in v1 — receipt is shown on screen only.
- Role-based access control with two roles: `admin` and `cashier`.
- Authentication is required for all actions; there is no public/anonymous access.

### Out of Scope for v1

- Multi-outlet / multi-branch management.
- Online storefront or self-order kiosk.
- Payment gateway / card / QR payment integration.
- Physical receipt/printer integration.
- Customer loyalty, membership, or rewards system.
- Advanced analytics (forecasting, trends beyond basic daily/periodic totals).
- Native mobile app.

---

## Feature Requirements — Overview

| # | Feature Module | Description | Priority |
|---|---|---|---|
| 1 | Authentication & Session | Staff login/logout, session handling | Must |
| 2 | User Management | Admin manages staff accounts and roles | Must |
| 3 | Category Management | Organize products into categories | Must |
| 4 | Product Management | Manage the product catalog and stock levels | Must |
| 5 | Point of Sale (Checkout) | Cart building and transaction checkout at the counter | Must |
| 6 | Transaction History | View and review past transactions | Must |
| 7 | Stock Adjustment | Manual stock correction outside of sales | Should |
| 8 | Sales Dashboard | Basic sales summary for admin | Should |

> Detailed technical implementation (API contracts, database schema, caching, indexing strategy, etc.) is covered separately in `TECH_SPEC.md`. Phased build order and timeline are covered separately in `ROADMAP.md`.

---

## Detailed Feature Specifications

### 1. Authentication & Session

**Description:** Staff must log in to access any part of the system. Sessions are role-aware so the UI and permitted actions differ between admin and cashier.

**User Stories:**

- As a **staff member (admin or cashier)**, I want to log in with a username and password so that I can access the system.
- As a **staff member**, I want to see a clear error message when I enter the wrong credentials so that I know to retry.
- As a **staff member**, I want to log out so that I can end my session securely on a shared device.
- As a **staff member**, I want my session to expire after a period of inactivity so that the counter device isn't left logged in.

**Acceptance Criteria:**

- Login fails with a generic "invalid username or password" message (does not reveal which field is wrong).
- A valid login returns a session/token and redirects to the correct landing page based on role.
- Logout invalidates the current session/token.
- Inactive sessions expire after a configurable duration (default: 8 hours).

**Dependencies:** User Management (accounts must exist to log in).

---

### 2. User Management

**Description:** Admin-only module to manage staff accounts who can log into the POS.

**User Stories:**

- As an **Admin**, I want to create a new staff account (name, username, password, role) so that a new employee can log in.
- As an **Admin**, I want to view a list of all staff accounts so that I can see who has access to the system.
- As an **Admin**, I want to view a staff account's detail (name, username, role, active status, created date) so that I can review it.
- As an **Admin**, I want to update a staff account's info (name, role, active status) so that I can reflect staffing changes.
- As an **Admin**, I want to reset a staff member's password so that I can help them if they're locked out.
- As an **Admin**, I want to deactivate a staff account (instead of hard-deleting it) so that former employees lose access while their transaction history stays intact.
- As a **Cashier**, I should **not** be able to access this module at all.

**Acceptance Criteria:**

- Only accounts with `admin` role can access any User Management endpoint/page.
- Username must be unique.
- Password is stored hashed, never in plain text.
- Deactivated accounts cannot log in but remain linked to their historical transactions.
- An admin cannot deactivate their own account while logged in as the only active admin.

**Dependencies:** Authentication.

---

### 3. Category Management

**Description:** Simple grouping mechanism for products (e.g., Coffee, Non-Coffee, Pastry).

**User Stories:**

- As an **Admin**, I want to create a new category (name) so that I can group related products.
- As an **Admin**, I want to view a list of all categories so that I can manage them.
- As an **Admin**, I want to view a category's detail so that I can see which products belong to it.
- As an **Admin**, I want to update a category's name so that I can correct or rename it.
- As an **Admin**, I want to delete a category so that I can remove ones I no longer use.
- As a **Cashier**, I want to filter products by category while building a cart so that I can find items faster.

**Acceptance Criteria:**

- Category name must be unique.
- A category cannot be deleted if it still has products assigned to it (system shows a clear error and suggests reassigning products first).

**Dependencies:** None (Product Management depends on this).

---

### 4. Product Management

**Description:** Core catalog of items sold in the store, including price and stock tracking.

**User Stories:**

- As an **Admin**, I want to create a new product (name, price, category, stock quantity, optional barcode, optional image) so that it becomes available for sale.
- As an **Admin or Cashier**, I want to view a list of all products (with pagination) so that I can browse the catalog.
- As an **Admin or Cashier**, I want to view a product's detail (name, price, category, current stock, barcode) so that I can confirm its information before selling or editing it.
- As an **Admin**, I want to update a product's information (name, price, category, image) so that I can keep the catalog accurate.
- As an **Admin**, I want to delete (soft-delete) a product so that discontinued items no longer appear for sale, without breaking historical transactions that reference it.
- As a **Cashier**, I want to search products by name or barcode so that I can quickly find an item at checkout.
- As an **Admin or Cashier**, I want the product list to clearly indicate when a product is out of stock so that it isn't sold by mistake.

**Acceptance Criteria:**

- Price and stock quantity must be non-negative numbers.
- Product name is required; barcode and image are optional.
- Deleting a product is a soft delete (`is_active = false`) — it disappears from the sales screen but historical transaction records remain fully intact.
- A product with 0 stock is still viewable but is visually flagged and cannot be added to a cart.
- Search matches partial name (case-insensitive) or exact barcode.

**Dependencies:** Category Management.

---

### 5. Point of Sale (Checkout)

**Description:** The core cashier workflow — building an order and completing a transaction. This is the most frequently used feature in the system.

**User Stories:**

- As a **Cashier**, I want to browse or search products and add them to a cart so that I can build an order.
- As a **Cashier**, I want to adjust the quantity of an item in the cart so that I can match what the customer ordered.
- As a **Cashier**, I want to remove an item from the cart so that I can correct mistakes before checkout.
- As a **Cashier**, I want to see the running subtotal and total update automatically as I edit the cart.
- As a **Cashier**, I want to clear the entire cart so that I can start over if needed.
- As a **Cashier**, I want to complete checkout by entering the amount received (cash) so that the system calculates the change automatically.
- As a **Cashier**, I want the system to prevent me from checking out an item that has insufficient stock so that I don't oversell.
- As a **Cashier**, I want to see an on-screen receipt/confirmation after checkout so that I can show or read it to the customer.
- As an **Admin**, I want to void a completed transaction (with a required reason) so that I can correct a cashier's mistake, with stock restored automatically.

**Acceptance Criteria:**

- Checkout is an atomic operation: the transaction record, its line items, and stock deduction either all succeed or all fail together (no partial state).
- If two checkouts attempt to sell the last unit of the same product at the same time, only one succeeds; the other receives a clear "insufficient stock" error.
- Amount received must be greater than or equal to the total; change is calculated as `amount received - total`.
- A voided transaction is marked `voided` (not deleted) and restores the stock of every item it contained.
- Only `admin` role can void a transaction.

**Dependencies:** Product Management, Authentication.

---

### 6. Transaction History

**Description:** A record of all completed (and voided) transactions for review and accountability.

**User Stories:**

- As an **Admin or Cashier**, I want to view a list of past transactions so that I can review what has been sold.
- As an **Admin or Cashier**, I want to filter the transaction list by date range so that I can review a specific period.
- As an **Admin**, I want to filter the transaction list by cashier so that I can review a specific staff member's activity.
- As an **Admin or Cashier**, I want to view a transaction's detail (items, quantities, prices, total, payment amount, change, cashier, timestamp, status) so that I can verify what happened in that sale.

**Acceptance Criteria:**

- List is sorted by most recent first by default.
- Voided transactions are visually distinguished from completed ones in both the list and detail view.
- Cashiers can view all transactions (read-only) but cannot void them.

**Dependencies:** Point of Sale (Checkout).

---

### 7. Stock Adjustment

**Description:** A way to correct or add stock outside of the sales flow (e.g., restocking, spoilage, inventory count correction).

**User Stories:**

- As an **Admin**, I want to manually increase a product's stock (restock) with a reason so that inventory reflects new deliveries.
- As an **Admin**, I want to manually decrease a product's stock with a reason (e.g., spoilage, correction) so that inventory reflects reality.
- As an **Admin**, I want to view the stock adjustment history of a product so that I can audit why its stock changed over time.

**Acceptance Criteria:**

- Every adjustment requires a reason (free text) and records who made it and when.
- Stock adjustments are logged separately from sales-driven stock deductions, so the two are distinguishable in history.
- Resulting stock quantity can never go below 0.

**Dependencies:** Product Management.

---

### 8. Sales Dashboard

**Description:** A basic summary view for admin to understand store performance without manual calculation.

**User Stories:**

- As an **Admin**, I want to see today's total sales amount and transaction count so that I know how the store is performing right now.
- As an **Admin**, I want to see total sales for a selected date range so that I can review a specific period.
- As an **Admin**, I want to see a simple list of best-selling products so that I know what to stock more of.

**Acceptance Criteria:**

- Dashboard figures exclude voided transactions.
- Date range defaults to "today" on load.
- Best-selling list ranks by quantity sold within the selected date range.

**Dependencies:** Transaction History.

---

## User Flows

### Flow 1: Staff Login

1. User opens BrewPoint in the browser.
2. User enters username and password.
3. System validates credentials.
4. On success, user is redirected to their role's landing page (Admin → Dashboard, Cashier → POS screen).
   - Alternative path: none.
   - Error state: invalid credentials show an inline error message and the form remains editable.

### Flow 2: Admin Adds a New Product

1. Admin navigates to Product Management.
2. Admin taps "Add Product."
3. Admin enters name, price, category, stock quantity, and optionally barcode/image.
4. Admin saves the product.
5. Product appears in the product list and becomes available on the POS screen.
   - Alternative path: none.
   - Error state: missing required fields or invalid numbers show inline validation and block saving.

### Flow 3: Cashier Completes a Checkout

1. Cashier searches or browses products on the POS screen.
2. Cashier adds one or more products to the cart, adjusting quantities as needed.
3. Cashier reviews the cart total.
4. Cashier taps "Checkout."
5. Cashier enters the amount received from the customer.
6. System validates stock availability for all items and calculates change.
7. System creates the transaction, deducts stock, and shows an on-screen receipt.
   - Alternative path: cashier clears the cart and starts over before checkout.
   - Error state: if any item's stock is insufficient at the moment of checkout, the system blocks checkout and highlights the affected item(s).

### Flow 4: Admin Reviews Sales Dashboard

1. Admin navigates to the Dashboard.
2. Dashboard loads today's total sales and transaction count by default.
3. Admin optionally selects a different date range.
4. Dashboard updates totals and best-selling product list accordingly.
   - Alternative path: none.
   - Error state: if no transactions exist in the selected range, dashboard shows an empty state with zeroed totals.

---

## User Flow Diagram

```text
[Login] --success--> [Role Check]
                          |
             -------------------------
             |                       |
             v                       v
      [Admin Dashboard]        [POS Screen (Cashier)]
             |                       |
   ----------------------      search/select products
   |          |         |            |
   v          v         v            v
[Products] [Users]  [Categories]  [Build Cart]
   |                                 |
   v                                 v
[Stock Adjustment]              [Checkout]
                                     |
                          -----------------------
                          |                     |
                          v                     v
                   [Success: Receipt]   [Error: Insufficient Stock]

[Transaction History] <-- accessible by both roles (read-only for Cashier)
```

---

## Release Planning

### MVP (v1.0)

- **Features:** Authentication, User Management, Category Management, Product Management, Point of Sale (Checkout), Transaction History, Stock Adjustment, Sales Dashboard.
- **Timeline:** See `ROADMAP.md`.
- **Success Criteria:** A cashier can log in, complete a full sale from product selection to receipt, and an admin can manage the catalog, staff, and review daily sales — all without data inconsistencies under concurrent use.

### Future Releases (high-level only — see `ROADMAP.md` for detail)

- **v1.1:** Performance and reliability enhancements (caching, indexing, rate limiting) — non-functional, no new user-facing features.
- **v1.2:** Realtime sales dashboard, richer reporting/export.
- **v1.3+:** Multi-outlet support, printer/receipt hardware integration, payment gateway integration — only if product direction expands beyond a single-outlet portfolio project.

---

## Open Questions & Assumptions

- **Question 1:** Should a cashier be allowed to see other cashiers' transaction history, or only their own?
- **Question 2:** Should voided transactions be restricted to same-day voids only, or allowed at any time?
- **Question 3:** Is a "draft"/held order (park a cart and resume later) needed for v1, or can it wait for a future release?
- **Assumption 1:** The system is used by a single store with one physical counter/device context in mind for MVP, though multiple cashier accounts may use it.
- **Assumption 2:** All monetary values are in a single currency (USD, changed from IDR 2026-07 per product decision) with no multi-currency support needed.
- **Assumption 3:** Tax is out of scope for v1 unless clarified otherwise; total = sum of line items.

---

## Glossary

- **Admin:** A staff role with full access — manages products, categories, users, stock adjustments, and views the dashboard.
- **Cashier:** A staff role limited to processing transactions and viewing (read-only) transaction history and products.
- **Checkout:** The action of finalizing a cart into a completed transaction.
- **Void:** Marking a completed transaction as cancelled after the fact, restoring any stock it had deducted.
- **Stock Adjustment:** A manual, non-sales change to a product's stock quantity, always tied to a recorded reason.
- **Soft delete:** Marking a record (e.g., product, user) as inactive rather than removing it from the database, so historical references remain valid.
