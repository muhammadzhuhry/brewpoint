import type { ProductStockStatus } from "@/lib/types";

export function getStockStatus(stock: number): ProductStockStatus {
  if (stock === 0) return "out-of-stock";
  if (stock <= 8) return "low-stock";
  return "in-stock";
}
