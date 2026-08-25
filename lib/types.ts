import type {
  users,
  categories,
  products,
  transactions,
  transactionItems,
  stockAdjustments,
} from "@/lib/db/schema";

export type User = Omit<typeof users.$inferSelect, "passwordHash">;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type TransactionItem = typeof transactionItems.$inferSelect;
export type StockAdjustment = typeof stockAdjustments.$inferSelect;

export type ProductSearchResult = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export type TransactionDetail = Transaction & {
  items: TransactionItem[];
};

export type CategoryWithProductCount = Category & {
  productCount: number;
};

export type BestSeller = {
  productId: string;
  productName: string;
  totalQuantity: number;
};

export type DashboardSummary = {
  totalSales: string;
  transactionCount: number;
};

export type ProductStockStatus = "out-of-stock" | "low-stock" | "in-stock";
