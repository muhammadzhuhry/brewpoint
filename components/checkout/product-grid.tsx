"use client";

import { Search } from "lucide-react";

import type { Product } from "@/lib/types";
import { getStockStatus } from "@/lib/product-status";
import { getTileColor } from "@/lib/avatar-color";
import { formatUSD } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

export function ProductGrid({
  products,
  isEmpty,
  quantities,
  onAddItem,
}: {
  products: Product[];
  isEmpty: boolean;
  quantities: Record<number, number>;
  onAddItem: (id: number) => void;
}) {
  if (isEmpty) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <EmptyState
          icon={<Search className="size-7" />}
          title="No products found"
          description="Try another search term or category."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-4">
      {products.map((product) => {
        const status = getStockStatus(product.stock);
        const [bg, fg] = getTileColor(product.name);
        const isOut = status === "out-of-stock";
        const qtyInCart = quantities[product.id] ?? 0;
        return (
          <button
            key={product.id}
            type="button"
            disabled={isOut}
            onClick={() => onAddItem(product.id)}
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
  );
}
