"use client";

import { BadgeCheck, Trash2, X } from "lucide-react";

import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function DeleteCategoryDialog({
  category,
  onOpenChange,
  onConfirm,
}: {
  category: Category | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const isBlocked = category ? category.productCount > 0 : false;

  return (
    <Dialog open={category !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]" showCloseButton={false}>
        <div className="flex flex-col gap-4 p-6">
          <div
            className={cn(
              "flex size-[46px] items-center justify-center rounded-[11px]",
              isBlocked ? "bg-warning-subtle" : "bg-destructive-subtle",
            )}
          >
            {isBlocked ? (
              <X className="size-[22px] text-destructive" />
            ) : (
              <Trash2 className="size-[22px] text-destructive" />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="font-display text-lg font-semibold text-primary">
              {isBlocked
                ? `Can't delete "${category?.name}"`
                : `Delete "${category?.name}"?`}
            </h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              {isBlocked
                ? `This category still has ${category?.productCount} ${category?.productCount === 1 ? "product" : "products"} assigned to it. Categories with products can't be deleted.`
                : "This category has no products assigned, so it can be safely removed. This can't be undone."}
            </p>
          </div>

          {isBlocked && (
            <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F0DFBD] bg-warning-subtle p-3">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-warning-subtle-foreground" />
              <span className="text-[12.5px] leading-relaxed text-warning-subtle-foreground">
                Reassign these products to another category first, then delete
                this one.
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2.5">
            {isBlocked ? (
              <Button onClick={() => onOpenChange(false)}>Got it</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={onConfirm}>
                  Delete category
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
