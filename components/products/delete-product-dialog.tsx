"use client";

import { Trash2 } from "lucide-react";

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
              If this product has sales history, it will be soft-deleted —
              hidden from the catalog but kept for reporting. Otherwise it
              will be permanently removed.
            </p>
          </div>

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
