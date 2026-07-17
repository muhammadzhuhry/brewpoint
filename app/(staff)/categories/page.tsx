"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { PageHeader } from "@/components/shared/page-header";

import { Plus, Pencil, Trash2, Tag, X, BadgeCheck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

type Category = {
  id: number;
  name: string;
  productCount: number;
  sampleProducts: string[];
};

const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Espresso",
    productCount: 8,
    sampleProducts: ["Cappuccino", "Caffè Latte", "Flat White", "Americano"],
  },
  {
    id: 2,
    name: "Brewed Coffee",
    productCount: 4,
    sampleProducts: ["Cold Brew", "Pour Over"],
  },
  {
    id: 3,
    name: "Non-Coffee",
    productCount: 5,
    sampleProducts: ["Matcha Latte", "Chai Latte"],
  },
  {
    id: 4,
    name: "Pastry",
    productCount: 6,
    sampleProducts: ["Butter Croissant", "Blueberry Muffin"],
  },
  { id: 5, name: "Seasonal Drinks", productCount: 0, sampleProducts: [] },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    id?: number;
  } | null>(null);
  const [formName, setFormName] = useState("");
  const [formError, setFormError] = useState("");

  const [detailTarget, setDetailTarget] = useState<Category | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const isBlocked = deleteTarget ? deleteTarget.productCount > 0 : false;

  const openAdd = () => {
    setModal({ mode: "add" });
    setFormName("");
  };

  const openEdit = (category: Category) => {
    setModal({ mode: "edit", id: category.id });
    setFormName(category.name);
  };

  const closeModal = () => {
    setModal(null);
  };

  const handleSave = () => {
    const name = formName.trim();

    if (!name) {
      setFormError("Category name is required.");
      return;
    }

    const isDuplicate = categories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== modal?.id,
    );
    if (isDuplicate) {
      setFormError("A Category with this name already exists.");
      return;
    }

    if (modal?.mode === "edit") {
      setCategories(
        categories.map((c) => (c.id === modal.id ? { ...c, name } : c)),
      );
    } else {
      setCategories([
        ...categories,
        { id: Date.now(), name, productCount: 0, sampleProducts: [] },
      ]);
    }

    closeModal();
  };

  const askDelete = (category: Category) => {
    setDeleteTarget(category);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const confirmDelete = () => {
    setCategories(categories.filter((c) => c.id !== deleteTarget?.id));
    setDeleteTarget(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        count={`${categories.length} ${categories.length === 1 ? "category" : "categories"}`}
        action={
          <Button onClick={() => openAdd()}>
            <Plus className="size-4" /> New category
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => {
          const isEmpty = category.productCount === 0;
          const sample = isEmpty
            ? "No products assigned yet"
            : category.sampleProducts.slice(0, 4).join(" · ");

          return (
            <div
              key={category.id}
              onClick={() => setDetailTarget(category)}
              className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-[18px]"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-[11px] bg-icon-chip-background">
                  <Tag className="size-5 text-icon-chip-foreground" />
                </div>
                <div className="flex gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(category);
                    }}
                  >
                    <Pencil className="size-[15px]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      askDelete(category);
                    }}
                  >
                    <Trash2 className="size-[15px] text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-semibold text-primary">
                    {category.name}
                  </span>
                  {isEmpty && <Badge variant="neutral">Empty</Badge>}
                </div>
                <span
                  className={cn(
                    "text-[12.5px] tabular-nums",
                    isEmpty ? "text-muted-foreground" : "text-muted-foreground",
                  )}
                >
                  {isEmpty
                    ? "No products"
                    : `${category.productCount} products`}
                </span>
              </div>

              <span className="min-h-[38px] text-[12.5px] leading-relaxed text-muted-foreground">
                {sample}
              </span>
            </div>
          );
        })}
      </div>

      <Sheet
        open={detailTarget !== null}
        onOpenChange={(open) => !open && setDetailTarget(null)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Category detail</SheetTitle>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-5 overflow-auto px-6 py-6">
            <div className="flex items-center gap-3.5">
              <div className="flex size-14 items-center justify-center rounded-[13px] bg-icon-chip-background">
                <Tag className="size-6 text-icon-chip-foreground" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-xl font-semibold text-primary">
                  {detailTarget?.name}
                </span>
                <span className="text-[13px] tabular-nums text-muted-foreground">
                  {detailTarget && detailTarget.productCount === 0
                    ? "No products assigned"
                    : `${detailTarget?.productCount} products`}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11.5px] font-semibold tracking-wide text-muted-foreground">
                PRODUCTS IN THIS CATEGORY
              </span>
              {detailTarget?.sampleProducts.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-border p-7 text-center text-[13px] text-muted-foreground">
                  No products are assigned to this category yet.
                </div>
              ) : (
                <div className="flex flex-col">
                  {detailTarget?.sampleProducts.map((name, i) => (
                    <div
                      key={name}
                      className={cn(
                        "flex h-[52px] items-center gap-3",
                        i < detailTarget.sampleProducts.length - 1 &&
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

          <SheetFooter>
            <Button
              className="flex-1"
              onClick={() => {
                if (detailTarget) openEdit(detailTarget);
                setDetailTarget(null);
              }}
            >
              <Pencil className="size-4" />
              Rename
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (detailTarget) askDelete(detailTarget);
                setDetailTarget(null);
              }}
            >
              Delete
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog
        open={modal !== null}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal?.mode === "edit" ? "Rename category" : "New category"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 px-6 py-6">
            <Label htmlFor="category-name">
              Category name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="category-name"
              placeholder="e.g. Seasonal Drinks"
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
                setFormError("");
              }}
            />
            {formError && (
              <span className="text-xs text-destructive">{formError}</span>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {modal?.mode === "edit" ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && cancelDelete()}
      >
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
                  ? `Can't delete "${deleteTarget?.name}"`
                  : `Delete "${deleteTarget?.name}"?`}
              </h3>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                {isBlocked
                  ? `This category still has ${deleteTarget?.productCount} ${deleteTarget?.productCount === 1 ? "product" : "products"} assigned to it. Categories with products can't be deleted.`
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
                <Button onClick={cancelDelete}>Got it</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={cancelDelete}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDelete}>
                    Delete category
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
