import type { Product } from "@/lib/types";
import { getStockStatus } from "@/lib/product-status";
import { getTileColor } from "@/lib/avatar-color";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";

export function ProductHeaderCard({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-[13px] font-display text-2xl font-semibold"
        style={{
          backgroundColor: getTileColor(product.name)[0],
          color: getTileColor(product.name)[1],
        }}
      >
        {product.name[0]}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="font-display text-xl font-semibold text-primary">
          {product.name}
        </span>
        <span className="text-[13px] text-muted-foreground">
          {product.category}
        </span>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              "font-display text-[28px] leading-none font-semibold tabular-nums",
              product.stock === 0 ? "text-destructive" : "text-primary",
            )}
          >
            {product.stock}
          </span>
          <span className="text-[13px] text-muted-foreground">in stock</span>
        </div>
        <StatusBadge status={getStockStatus(product.stock)} />
      </div>
    </div>
  );
}
