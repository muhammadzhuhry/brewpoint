"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Product, Receipt, Transaction } from "@/lib/types";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { apiPost } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { useCartStore } from "@/stores/cart-store";
import { CheckoutHeader } from "@/components/checkout/checkout-header";
import { ProductGrid } from "@/components/checkout/product-grid";
import { CartPanel } from "@/components/checkout/cart-panel";
import { CheckoutDialog } from "@/components/checkout/checkout-dialog";
import { ReceiptOverlay } from "@/components/checkout/receipt-overlay";

function getNow() {
  return new Date();
}

function getReceiptTimeLabel(timestamp: string | Date) {
  const d = new Date(timestamp);
  return (
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

export default function CheckoutPage() {
  const queryClient = useQueryClient();

  const { data: productsData } = useProducts({ pageSize: 1000 });
  const products = productsData?.items ?? [];

  const { data: categoriesData } = useCategories();
  const categories = categoriesData ?? [];

  const { quantities, order, addItem, increment, decrement, clearCart } =
    useCartStore();

  const [now, setNow] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sort, setSort] = useState("Name A–Z");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [received, setReceived] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(getNow()), 1000);
    return () => clearInterval(interval);
  }, []);

  const dateLabel = now
    ? now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "—";
  const timeLabel = now
    ? now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      categoryFilter === "All" || p.categoryId === categoryFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      p.name.toLowerCase().includes(q) ||
      (p.barcode?.toLowerCase().includes(q) ?? false);
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "Price: Low to high")
      return Number(a.price) - Number(b.price);
    if (sort === "Price: High to low")
      return Number(b.price) - Number(a.price);
    return a.name.localeCompare(b.name);
  });

  const cartLines = order
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined)
    .map((product) => ({ product, qty: quantities[product.id] }));

  const subtotal = cartLines.reduce(
    (sum, { product, qty }) => sum + Number(product.price) * qty,
    0,
  );
  const itemCount = cartLines.reduce((sum, { qty }) => sum + qty, 0);
  const hasStockError = cartLines.some(
    ({ product, qty }) => qty > product.stockQuantity,
  );

  const receivedNum = parseFloat(received);
  const isValidReceived = !isNaN(receivedNum) && receivedNum >= subtotal;
  const change = isValidReceived ? receivedNum - subtotal : 0;
  const quickCashValues = Array.from(
    new Set([
      subtotal,
      Math.ceil(subtotal / 5) * 5,
      Math.ceil(subtotal / 10) * 10,
      Math.ceil(subtotal / 20) * 20,
    ]),
  ).slice(0, 4);

  const checkoutMutation = useMutation({
    mutationFn: (body: {
      items: { productId: string; quantity: number }[];
      amountReceived: string;
    }) => apiPost<Transaction>("/transactions", body),
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Checkout failed",
      );
    },
  });

  const openCheckout = () => {
    setReceived("");
    setCheckoutOpen(true);
  };

  const handleCompleteSale = () => {
    if (!isValidReceived) return;

    const lineSnapshot = cartLines.map(({ product, qty }) => ({
      name: product.name,
      qty,
      price: Number(product.price),
    }));

    checkoutMutation.mutate(
      {
        items: cartLines.map(({ product, qty }) => ({
          productId: product.id,
          quantity: qty,
        })),
        amountReceived: received,
      },
      {
        onSuccess: (transaction) => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          setReceipt({
            ref: `TX-${transaction.id.slice(0, 8).toUpperCase()}`,
            time: getReceiptTimeLabel(transaction.createdAt),
            lines: lineSnapshot,
            subtotal: Number(transaction.totalAmount),
            paid: Number(transaction.amountReceived),
            change: Number(transaction.changeAmount),
          });
          clearCart();
          setCheckoutOpen(false);
          setReceived("");
          toast.success("Sale completed");
        },
      },
    );
  };

  return (
    <div className="-m-6 flex h-[calc(100%+3rem)]">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <CheckoutHeader
          dateLabel={dateLabel}
          timeLabel={timeLabel}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categories={categories}
          products={products}
        />

        <div className="flex-1 overflow-auto px-6 pb-6">
          <ProductGrid
            products={sortedProducts}
            isEmpty={filteredProducts.length === 0}
            quantities={quantities}
            onAddItem={addItem}
          />
        </div>
      </div>

      <CartPanel
        cartLines={cartLines}
        itemCount={itemCount}
        subtotal={subtotal}
        hasStockError={hasStockError}
        onIncrement={increment}
        onDecrement={decrement}
        onClearCart={clearCart}
        onCharge={openCheckout}
      />

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        subtotal={subtotal}
        received={received}
        onReceivedChange={setReceived}
        quickCashValues={quickCashValues}
        isValidReceived={isValidReceived}
        change={change}
        onCompleteSale={handleCompleteSale}
      />

      <ReceiptOverlay receipt={receipt} onNewSale={() => setReceipt(null)} />
    </div>
  );
}
