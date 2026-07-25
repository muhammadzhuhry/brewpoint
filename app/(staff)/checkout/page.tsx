"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Coffee,
  Cookie,
  CreditCard,
  LayoutGrid,
  Leaf,
  Minus,
  Plus,
  Printer,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import type { Product } from "@/lib/types";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { getStockStatus } from "@/lib/product-status";
import { getTileColor } from "@/lib/avatar-color";
import { formatUSD } from "@/lib/format-currency";
import { mockCurrentUser } from "@/lib/mock-current-user";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Receipt = {
  ref: string;
  time: string;
  lines: { name: string; qty: number; price: number }[];
  subtotal: number;
  paid: number;
  change: number;
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  All: LayoutGrid,
  Espresso: Coffee,
  "Brewed Coffee": Coffee,
  "Non-Coffee": Leaf,
  Pastry: Cookie,
  "Seasonal Drinks": Sparkles,
};

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

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sort, setSort] = useState<string | null>("popular");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [received, setReceived] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [nextRef, setNextRef] = useState(2042);

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
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
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
      <div className="flex min-w-0 flex-1 flex-col overflow-auto p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or scan barcode…"
              className="h-12 w-full rounded-xl border border-border bg-card pr-3.5 pl-10 text-[15px] text-foreground outline-none"
            />
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-12 w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Sort: Popular</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
              <SelectItem value="price-asc">Price: Low to high</SelectItem>
              <SelectItem value="price-desc">Price: High to low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-0.5">
          {["All", ...categories].map((c) => {
            const isOn = categoryFilter === c;
            const count =
              c === "All"
                ? products.length
                : products.filter((p) => p.category === c).length;
            const Icon = CATEGORY_ICONS[c] ?? Coffee;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategoryFilter(c)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-1.5 text-[13.5px] font-medium whitespace-nowrap",
                  isOn
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full",
                    isOn ? "bg-white/20" : "bg-icon-chip-background",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-3.5",
                      isOn ? "text-secondary" : "text-primary",
                    )}
                  />
                </span>
                {c}
                <span
                  className={cn(
                    "flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                    isOn
                      ? "bg-white/15 text-primary-foreground"
                      : "bg-[#F1F0EC] text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-10">
            <EmptyState
              icon={<Search className="size-7" />}
              title="No products found"
              description="Try another search term or category."
            />
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-4">
            {sortedProducts.map((product) => {
              const status = getStockStatus(product.stock);
              const [bg, fg] = getTileColor(product.name);
              const isOut = status === "out-of-stock";
              const qtyInCart = quantities[product.id] ?? 0;
              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={isOut}
                  onClick={() => addItem(product.id)}
                  className={cn(
                    "flex flex-col gap-2.5 rounded-2xl border bg-card p-3 text-left",
                    qtyInCart > 0 ? "border-primary" : "border-border",
                    isOut && "cursor-not-allowed opacity-70",
                  )}
                >
                  <div
                    className="relative flex h-32 items-center justify-center rounded-[13px]"
                    style={{ backgroundColor: bg }}
                  >
                    <span
                      className="font-display text-5xl font-semibold"
                      style={{ color: fg }}
                    >
                      {product.name[0]}
                    </span>
                    {qtyInCart > 0 && (
                      <span className="absolute top-2 right-2 flex min-w-[26px] items-center justify-center rounded-full bg-primary px-1.5 py-1 text-[13.5px] font-semibold tabular-nums text-primary-foreground shadow">
                        {qtyInCart}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {product.name}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[17px] font-semibold tabular-nums text-primary">
                        {formatUSD(product.price)}
                      </span>
                      {isOut && (
                        <span className="rounded-full bg-destructive-subtle px-2.5 py-0.5 text-[11.5px] font-semibold text-destructive-subtle-foreground">
                          Out of stock
                        </span>
                      )}
                      {status === "low-stock" && (
                        <span className="rounded-full bg-warning-subtle px-2.5 py-0.5 text-[11.5px] font-semibold text-warning-subtle-foreground">
                          {product.stock} left
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <aside className="flex w-[400px] shrink-0 flex-col border-l border-border bg-card">
        <div className="flex items-center justify-between border-b border-[#F1F0EC] px-[22px] py-5">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-lg font-semibold text-primary">
              Current order
            </h2>
            {order.length > 0 && (
              <span className="flex min-w-[22px] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold tabular-nums text-primary-foreground">
                {itemCount}
              </span>
            )}
          </div>
          {order.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-destructive"
            >
              <Trash2 className="size-[15px]" />
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {order.length === 0 ? (
            <div className="flex h-full items-center justify-center p-8">
              <EmptyState
                icon={<ShoppingBag className="size-7" />}
                title="No items yet"
                description="Tap a product to start building the customer's order."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-3.5">
              {cartLines.map(({ product, qty }) => {
                const over = qty > product.stock;
                return (
                  <div
                    key={product.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-2",
                      over && "border border-[#EBC6C1] bg-destructive-subtle",
                    )}
                  >
                    <div className="flex size-10.5 shrink-0 items-center justify-center rounded-[10px] bg-icon-chip-background font-display text-[17px] font-semibold text-primary">
                      {product.name[0]}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[13.5px] font-medium text-foreground">
                        {product.name}
                      </span>
                      {over ? (
                        <span className="text-xs font-semibold text-destructive">
                          Only {product.stock} in stock
                        </span>
                      ) : (
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {formatUSD(product.price)} each
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 rounded-[9px] bg-[#F3F3F1] p-[3px]">
                      <button
                        type="button"
                        onClick={() => decrement(product.id)}
                        className="flex size-7 items-center justify-center rounded-lg bg-card shadow-sm"
                      >
                        <Minus className="size-3.5 text-primary" />
                      </button>
                      <span
                        className={cn(
                          "min-w-[22px] text-center text-sm font-semibold tabular-nums",
                          over ? "text-destructive" : "text-primary",
                        )}
                      >
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => increment(product.id)}
                        className="flex size-7 items-center justify-center rounded-lg bg-card shadow-sm"
                      >
                        <Plus className="size-3.5 text-primary" />
                      </button>
                    </div>
                    <span className="w-14 text-right text-[13.5px] font-semibold tabular-nums text-foreground">
                      {formatUSD(product.price * qty)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {order.length > 0 && (
          <div className="flex flex-col gap-3.5 border-t border-[#F1F0EC] px-[22px] py-[18px]">
            {hasStockError && (
              <div className="flex items-center gap-2.5 rounded-[10px] border border-[#EBC6C1] bg-destructive-subtle px-3.5 py-2.5">
                <AlertCircle className="size-4 shrink-0 text-destructive" />
                <span className="text-[12.5px] font-medium text-destructive-subtle-foreground">
                  Some items exceed available stock. Adjust the highlighted
                  lines to continue.
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {formatUSD(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] text-muted-foreground">
                  Items
                </span>
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {itemCount}
                </span>
              </div>
              <div className="h-px bg-[#F1F0EC]" />
              <div className="flex items-baseline justify-between">
                <span className="font-display text-base font-semibold text-primary">
                  Total
                </span>
                <span className="text-2xl font-semibold tracking-tight tabular-nums text-primary">
                  {formatUSD(subtotal)}
                </span>
              </div>
            </div>
            <Button
              className="h-14 text-base"
              disabled={hasStockError}
              onClick={openCheckout}
            >
              <ShoppingCart className="size-[19px]" />
              Charge {formatUSD(subtotal)}
            </Button>
          </div>
        )}
      </aside>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Take payment</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 p-6">
            <div className="flex items-center justify-between rounded-xl bg-icon-chip-background px-[18px] py-4">
              <span className="text-sm font-medium text-icon-chip-foreground">
                Total due
              </span>
              <span className="font-display text-[28px] font-semibold tracking-tight text-primary">
                {formatUSD(subtotal)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <CreditCard className="size-[15px] text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">
                  Cash received
                </span>
              </div>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-xl font-semibold text-primary">
                  $
                </span>
                <input
                  value={received}
                  onChange={(e) =>
                    setReceived(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  placeholder="0.00"
                  className="h-[60px] w-full rounded-xl border border-border bg-card pr-4 pl-9 text-2xl font-semibold text-primary outline-none"
                />
              </div>
              <div className="mt-0.5 flex gap-2">
                {quickCashValues.map((value, i) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReceived(value.toFixed(2))}
                    className="flex h-10 flex-1 items-center justify-center rounded-[10px] border border-border bg-card text-[13.5px] font-semibold text-primary"
                  >
                    {i === 0 ? "Exact" : formatUSD(value)}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={cn(
                "flex items-center justify-between rounded-xl border border-dashed px-[18px] py-3.5",
                isValidReceived
                  ? "border-[#BCDCC4] bg-[#F1F8F2]"
                  : "border-border bg-[#FAFAF8]",
              )}
            >
              <span className="text-sm font-medium text-muted-foreground">
                Change due
              </span>
              <span
                className={cn(
                  "text-xl font-semibold tabular-nums",
                  isValidReceived ? "text-success" : "text-muted-foreground",
                )}
              >
                {isValidReceived ? formatUSD(change) : "—"}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
              Back
            </Button>
            <Button disabled={!isValidReceived} onClick={handleCompleteSale}>
              Complete sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/55">
          <div className="flex max-h-210 w-100 flex-col overflow-auto rounded-2xl bg-card shadow-[0_20px_60px_rgba(15,20,24,0.32)]">
            <div className="flex flex-col items-center gap-3.5 border-b border-dashed border-border px-7 pt-7 pb-5 text-center">
              <div className="flex size-15 items-center justify-center rounded-full bg-success-subtle">
                <Check className="size-7.5 text-success" strokeWidth={2.2} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-display text-xl font-semibold text-primary">
                  Payment complete
                </span>
                <span className="text-[13px] tabular-nums text-muted-foreground">
                  {receipt.ref} · {receipt.time}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-7 py-5.5">
              <span className="text-[11.5px] font-semibold tracking-wide text-muted-foreground">
                MAPLE &amp; VINE COFFEE · {mockCurrentUser.name.toUpperCase()}
              </span>

              <div className="flex flex-col gap-2">
                {receipt.lines.map((line, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-6.5 text-[13px] tabular-nums text-muted-foreground">
                      {line.qty}×
                    </span>
                    <span className="flex-1 text-[13.5px] text-foreground">
                      {line.name}
                    </span>
                    <span className="text-[13.5px] font-medium tabular-nums text-foreground">
                      {formatUSD(line.price * line.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-[#F1F0EC]" />

              <div className="flex justify-between">
                <span className="text-[13.5px] text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-[13.5px] font-medium tabular-nums text-foreground">
                  {formatUSD(receipt.subtotal)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-base font-semibold text-primary">
                  Total
                </span>
                <span className="text-xl font-semibold tabular-nums text-primary">
                  {formatUSD(receipt.subtotal)}
                </span>
              </div>

              <div className="mt-1 flex flex-col gap-2 rounded-xl bg-table-header-background p-3.5">
                <div className="flex justify-between">
                  <span className="text-[13px] text-muted-foreground">
                    Cash received
                  </span>
                  <span className="text-[13.5px] font-medium tabular-nums text-foreground">
                    {formatUSD(receipt.paid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-muted-foreground">
                    Change
                  </span>
                  <span className="text-[13.5px] font-semibold tabular-nums text-success">
                    {formatUSD(receipt.change)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-7 pt-4 pb-6">
              <Button variant="secondary" className="shrink-0">
                <Printer className="size-4" />
                Print
              </Button>
              <Button className="flex-1" onClick={() => setReceipt(null)}>
                New sale
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
