"use client";

import { Pencil, Tag } from "lucide-react";

import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

export function CategoryDetailSheet({
  category,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  category: Category | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <Sheet open={category !== null} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Category detail</SheetTitle>
        </SheetHeader>

        {category && (
          <div className="flex flex-1 flex-col gap-5 overflow-auto px-6 py-6">
            <div className="flex items-center gap-3.5">
              <div className="flex size-14 items-center justify-center rounded-[13px] bg-icon-chip-background">
                <Tag className="size-6 text-icon-chip-foreground" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-xl font-semibold text-primary">
                  {category.name}
                </span>
                <span className="text-[13px] tabular-nums text-muted-foreground">
                  {category.productCount === 0
                    ? "No products assigned"
                    : `${category.productCount} products`}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11.5px] font-semibold tracking-wide text-muted-foreground">
                PRODUCTS IN THIS CATEGORY
              </span>
              {category.sampleProducts.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-border p-7 text-center text-[13px] text-muted-foreground">
                  No products are assigned to this category yet.
                </div>
              ) : (
                <div className="flex flex-col">
                  {category.sampleProducts.map((name, i) => (
                    <div
                      key={name}
                      className={cn(
                        "flex h-[52px] items-center gap-3",
                        i < category.sampleProducts.length - 1 &&
                          "border-b border-[#F1F0EC]",
                      )}
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-icon-chip-background text-sm font-semibold text-primary">
                        {name[0]}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <SheetFooter>
          <Button
            className="flex-1"
            onClick={() => category && onEdit(category)}
          >
            <Pencil className="size-4" />
            Rename
          </Button>
          <Button
            variant="destructive"
            onClick={() => category && onDelete(category)}
          >
            Delete
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
