"use client";

import { Trash2 } from "lucide-react";

import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function DeleteCategoryDialog({
  category,
  error,
  onOpenChange,
  onConfirm,
}: {
  category: Category | null;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={category !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]" showCloseButton={false}>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex size-[46px] items-center justify-center rounded-[11px] bg-destructive-subtle">
            <Trash2 className="size-[22px] text-destructive" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="font-display text-lg font-semibold text-primary">
              Delete &quot;{category?.name}&quot;?
            </h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              If this category still has products assigned to it, it can&apos;t
              be deleted — reassign them first.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-[10px] border border-[#EBC6C1] bg-destructive-subtle p-3">
              <span className="text-[12.5px] leading-relaxed text-destructive-subtle-foreground">
                {error}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Delete category
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
