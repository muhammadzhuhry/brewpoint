"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function DeleteProductDialog({
  product,
  onOpenChange,
  onConfirm,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const hasHistory = product ? product.txnCount > 0 : false;

  return (
    <Dialog open={product !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]" showCloseButton={false}>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex size-[46px] items-center justify-center rounded-[11px] bg-destructive-subtle">
            <Trash2 className="size-[22px] text-destructive" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="font-display text-lg font-semibold text-primary">
              Delete &quot;{product?.name}&quot;?
            </h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              {hasHistory
                ? "This product has sales history, so it will be soft-deleted — removed from the catalog but retained for reporting."
                : "This product has no sales history and will be permanently removed from the catalog."}
            </p>
          </div>

          {hasHistory && (
            <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F0DFBD] bg-warning-subtle p-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-subtle-foreground" />
              <span className="text-[12.5px] leading-relaxed text-warning-subtle-foreground">
                This product appears in <strong>{product?.txnCount}</strong>{" "}
                past transactions. It will be hidden from the catalog but
                kept for reporting (soft delete).
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Delete product
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
