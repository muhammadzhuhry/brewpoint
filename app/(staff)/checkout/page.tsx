"use client";

import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { getStockStatus } from "@/lib/product-status";
import { getTileColor } from "@/lib/avatar-color";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  return (
    <div className="-m-6 flex h-full">
      <div className="flex min-w-0 flex-1 flex-col overflow-auto p-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-4">
          {MOCK_PRODUCTS.map((product) => {
            const status = getStockStatus(product.stock);
            const [bg, fg] = getTileColor(product.name);
            const isOut = status === "out-of-stock";
            return (
              <button
                key={product.id}
                type="button"
                disabled={isOut}
                className={cn(
                  "flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-3 text-left",
                  isOut && "cursor-not-allowed opacity-70",
                )}
              >
                <div
                  className="flex h-32 items-center justify-center rounded-[13px]"
                  style={{ backgroundColor: bg }}
                >
                  <span
                    className="font-display text-5xl font-semibold"
                    style={{ color: fg }}
                  >
                    {product.name[0]}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    {product.name}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[17px] font-semibold tabular-nums text-primary">
                      ${product.price.toFixed(2)}
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
      </div>
      <aside className="w-[400px] shrink-0 border-l border-border bg-card">
        <p className="p-6">Cart placeholder</p>
      </aside>
    </div>
  );
}
