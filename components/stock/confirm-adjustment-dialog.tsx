"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function ConfirmAdjustmentDialog({
  open,
  product,
  type,
  qty,
  reason,
  newLevel,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  product: Product | null;
  type: "increase" | "decrease";
  qty: number;
  reason: string;
  newLevel: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const isIncrease = type === "increase";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]" showCloseButton={false}>
        <div className="flex flex-col gap-4 p-6">
          <div
            className={cn(
              "flex size-[46px] items-center justify-center rounded-[11px]",
              isIncrease ? "bg-success-subtle" : "bg-destructive-subtle",
            )}
          >
            {isIncrease ? (
              <ArrowUp className="size-[22px] text-success" />
            ) : (
              <ArrowDown className="size-[22px] text-destructive" />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="font-display text-lg font-semibold text-primary">
              {isIncrease
                ? `Add ${qty} to ${product?.name}?`
                : `Remove ${qty} from ${product?.name}?`}
            </h3>
            {reason.trim() && (
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                Reason: “{reason.trim()}”. This is logged to the adjustment
                history under your name.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-[10px] border border-border bg-table-header-background px-3.5 py-3">
            <span className="text-[13px] text-muted-foreground">
              New stock level
            </span>
            <span className="text-base font-semibold tabular-nums text-primary">
              {product?.stockQuantity} → {newLevel}
            </span>
          </div>

          <div className="flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onConfirm}>Confirm adjustment</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
