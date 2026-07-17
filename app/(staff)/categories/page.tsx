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

import { Plus, Pencil, Trash2, Tag } from "lucide-react";

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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
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
                    onClick={() => openEdit(category)}
                  >
                    <Pencil className="size-[15px]" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
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
          <div className="flex flex-col gap-1.5">
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
    </div>
  );
}
