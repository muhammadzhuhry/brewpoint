"use client";

import {
  AlertCircle,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import type { Product } from "@/lib/types";
import { formatUSD } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export function CartPanel({
  cartLines,
  itemCount,
  subtotal,
  hasStockError,
  onIncrement,
  onDecrement,
  onClearCart,
  onCharge,
}: {
  cartLines: { product: Product; qty: number }[];
  itemCount: number;
  subtotal: number;
  hasStockError: boolean;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onClearCart: () => void;
  onCharge: () => void;
}) {
  return (
    <aside className="flex w-[400px] shrink-0 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-[#F1F0EC] px-[22px] py-5">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-lg font-semibold text-primary">
            Current order
          </h2>
          {cartLines.length > 0 && (
            <span className="flex min-w-[22px] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold tabular-nums text-primary-foreground">
              {itemCount}
            </span>
          )}
        </div>
        {cartLines.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-destructive"
          >
            <Trash2 className="size-[15px]" />
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {cartLines.length === 0 ? (
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
              const over = qty > product.stockQuantity;
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
                        Only {product.stockQuantity} in stock
                      </span>
                    ) : (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {formatUSD(Number(product.price))} each
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 rounded-[9px] bg-[#F3F3F1] p-[3px]">
                    <button
                      type="button"
                      onClick={() => onDecrement(product.id)}
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
                      onClick={() => onIncrement(product.id)}
                      className="flex size-7 items-center justify-center rounded-lg bg-card shadow-sm"
                    >
                      <Plus className="size-3.5 text-primary" />
                    </button>
                  </div>
                  <span className="w-14 text-right text-[13.5px] font-semibold tabular-nums text-foreground">
                    {formatUSD(Number(product.price) * qty)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cartLines.length > 0 && (
        <div className="flex flex-col gap-3.5 border-t border-[#F1F0EC] px-[22px] py-[18px]">
          {hasStockError && (
            <div className="flex items-center gap-2.5 rounded-[10px] border border-[#EBC6C1] bg-destructive-subtle px-3.5 py-2.5">
              <AlertCircle className="size-4 shrink-0 text-destructive" />
              <span className="text-[12.5px] font-medium text-destructive-subtle-foreground">
                Some items exceed available stock. Adjust the highlighted lines
                to continue.
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
              <span className="text-[13.5px] text-muted-foreground">Items</span>
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
            onClick={onCharge}
          >
            <ShoppingCart className="size-[19px]" />
            Charge {formatUSD(subtotal)}
          </Button>
        </div>
      )}
    </aside>
  );
}
