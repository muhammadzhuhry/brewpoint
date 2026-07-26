export type Category = {
  id: number;
  name: string;
  productCount: number;
  sampleProducts: string[];
};

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode: string;
  txnCount: number;
  imageUrl?: string;
};

export type ProductStockStatus = "out-of-stock" | "low-stock" | "in-stock";

export type User = {
  id: number;
  name: string;
  username: string;
  role: "Admin" | "Cashier";
  active: boolean;
  joined: string;
  last: string;
};

export type StockAdjustment = {
  type: "increase" | "decrease";
  qty: number;
  reason: string;
  by: string;
  when: string;
  result: number;
};

export type TransactionItem = {
  name: string;
  qty: number;
  price: number;
};

export type Transaction = {
  id: string;
  time: string;
  cashier: string;
  status: "completed" | "voided";
  method: string;
  received: number;
  items: TransactionItem[];
  voidReason?: string;
  voidBy?: string;
};

export type Receipt = {
  ref: string;
  time: string;
  lines: { name: string; qty: number; price: number }[];
  subtotal: number;
  paid: number;
  change: number;
};
