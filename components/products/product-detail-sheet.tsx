"use client";

import { AlertCircle, Pencil } from "lucide-react";

import type { Product } from "@/lib/types";
import { getStockStatus } from "@/lib/product-status";
import { getTileColor } from "@/lib/avatar-color";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

export function ProductDetailSheet({
  product,
  categoryNameById,
  onOpenChange,
  isAdmin,
  onEdit,
  onDelete,
}: {
  product: Product | null;
  categoryNameById: Record<string, string>;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  const [tileBg, tileFg] = product
    ? getTileColor(product.name)
    : ["#EFEFEF", "#6B7280"];

  return (
    <Sheet open={product !== null} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Product detail</SheetTitle>
        </SheetHeader>

        {product && (
          <div className="flex flex-1 flex-col gap-4.5 overflow-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <div
                className="flex size-18 shrink-0 items-center justify-center rounded-2xl font-display text-[30px] font-semibold"
                style={{
                  backgroundColor: tileBg,
                  color: tileFg,
                  opacity:
                    getStockStatus(product.stockQuantity) === "out-of-stock"
                      ? 0.6
                      : 1,
                }}
              >
                {product.name[0]}
              </div>
              <div className="flex flex-col gap-1.75">
                <span className="font-display text-xl font-semibold text-primary">
                  {product.name}
                </span>
                <StatusBadge status={getStockStatus(product.stockQuantity)} />
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              {[
                [
                  "CATEGORY",
                  categoryNameById[product.categoryId] ?? "—",
                ],
                ["PRICE", `$${Number(product.price).toFixed(2)}`],
                [
                  "STOCK QUANTITY",
                  product.stockQuantity === 0
                    ? "0 — out of stock"
                    : `${product.stockQuantity} units`,
                ],
                ["BARCODE", product.barcode ?? "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 border-b border-[#F1F0EC] pb-3.5"
                >
                  <span className="text-[11.5px] font-semibold tracking-wide text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-[15px] font-medium tabular-nums text-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {getStockStatus(product.stockQuantity) === "out-of-stock" && (
              <div className="flex items-center gap-2.5 rounded-[10px] border border-[#EBC6C1] bg-destructive-subtle px-3.5 py-2.5">
                <AlertCircle className="size-4 shrink-0 text-destructive-subtle-foreground" />
                <span className="text-[12.5px] font-medium text-destructive-subtle-foreground">
                  Out of stock — not sellable on the POS until restocked.
                </span>
              </div>
            )}
          </div>
        )}

        {isAdmin && product && (
          <SheetFooter>
            <Button className="flex-1" onClick={() => onEdit(product)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => onDelete(product)}>
              Delete
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
