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
