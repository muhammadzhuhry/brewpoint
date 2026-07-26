"use client";

import { useEffect, useState } from "react";

import type { Product, Receipt } from "@/lib/types";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { useCartStore } from "@/stores/cart-store";
import { CheckoutHeader } from "@/components/checkout/checkout-header";
import { ProductGrid } from "@/components/checkout/product-grid";
import { CartPanel } from "@/components/checkout/cart-panel";
import { CheckoutDialog } from "@/components/checkout/checkout-dialog";
import { ReceiptOverlay } from "@/components/checkout/receipt-overlay";

function getNow() {
  return new Date();
}

function getReceiptTimeLabel() {
  const now = new Date();
  return (
    now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " · " +
    now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

export default function CheckoutPage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const { quantities, order, addItem, increment, decrement, clearCart } =
    useCartStore();

  const [now, setNow] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sort, setSort] = useState<string | null>("Sort: Popular");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [received, setReceived] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [nextRef, setNextRef] = useState(2042);

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

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      categoryFilter === "All" || p.category === categoryFilter;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "Name A–Z") return a.name.localeCompare(b.name);
    if (sort === "Price: Low to high") return a.price - b.price;
    if (sort === "Price: High to low") return b.price - a.price;
    return b.txnCount - a.txnCount;
  });

  const cartLines = order
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined)
    .map((product) => ({ product, qty: quantities[product.id] }));

  const subtotal = cartLines.reduce(
    (sum, { product, qty }) => sum + product.price * qty,
    0,
  );
  const itemCount = cartLines.reduce((sum, { qty }) => sum + qty, 0);
  const hasStockError = cartLines.some(
    ({ product, qty }) => qty > product.stock,
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

  const openCheckout = () => {
    setReceived("");
    setCheckoutOpen(true);
  };

  const handleCompleteSale = () => {
    if (!isValidReceived) return;
    setProducts(
      products.map((p) =>
        quantities[p.id]
          ? { ...p, stock: Math.max(0, p.stock - quantities[p.id]) }
          : p,
      ),
    );
    setReceipt({
      ref: `TX-${nextRef}`,
      time: getReceiptTimeLabel(),
      lines: cartLines.map(({ product, qty }) => ({
        name: product.name,
        qty,
        price: product.price,
      })),
      subtotal,
      paid: receivedNum,
      change,
    });
    setNextRef(nextRef + 1);
    clearCart();
    setCheckoutOpen(false);
    setReceived("");
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
