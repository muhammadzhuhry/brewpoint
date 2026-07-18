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
