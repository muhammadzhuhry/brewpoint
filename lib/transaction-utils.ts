import type { Transaction } from "@/lib/types";

export function getTransactionTotal(t: Transaction) {
  return t.items.reduce((sum, item) => sum + item.qty * item.price, 0);
}

export function getItemCount(t: Transaction) {
  return t.items.reduce((sum, item) => sum + item.qty, 0);
}
