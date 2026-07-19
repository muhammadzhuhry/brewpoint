"use client";

import { useState } from "react";
import { Plus, Tag, Pencil, Trash2, Leaf } from "lucide-react";

import type { Category } from "@/lib/types";
import { MOCK_CATEGORIES } from "@/lib/mock-categories";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog";
import { CategoryDetailSheet } from "@/components/categories/category-detail-sheet";

export default function CategoriesPage() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [nextId, setNextId] = useState(categories.length + 1);

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    category: Category | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [detailTarget, setDetailTarget] = useState<Category | null>(null);

  const openAdd = () => setModal({ mode: "add", category: null });
  const openEdit = (category: Category) => setModal({ mode: "edit", category });
  const closeModal = () => setModal(null);

  const handleFormSubmit = (name: string) => {
    if (modal?.mode === "edit" && modal.category) {
      const id = modal.category.id;
      setCategories(categories.map((c) => (c.id === id ? { ...c, name } : c)));
    } else {
      setCategories([
        ...categories,
        { id: nextId, name, productCount: 0, sampleProducts: [] },
      ]);
      setNextId(nextId + 1);
    }
    closeModal();
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
          <Button onClick={openAdd}>
            <Plus className="size-4" /> New category
          </Button>
        }
      />

      {categories.length === 0 ? (
        <div className="flex min-h-[440px] items-center justify-center rounded-xl border border-border bg-card p-10">
          <EmptyState
            icon={<Leaf className="size-7" />}
            title="No categories yet"
            description="Create your first category to start organizing the menu — products get assigned to one."
            action={
              <Button onClick={openAdd}>
                <Plus className="size-4" /> Create your first category
              </Button>
            }
          />
        </div>
      ) : (
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
                className="flex cursor-pointer flex-col gap-3.5 rounded-xl border border-border bg-card p-[18px]"
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
                        setDeleteTarget(category);
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
                  <span className="text-[12.5px] tabular-nums text-muted-foreground">
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
      )}

      <CategoryFormDialog
        open={modal !== null}
        onOpenChange={(open) => !open && closeModal()}
        mode={modal?.mode ?? "add"}
        category={modal?.category ?? null}
        existingNames={categories
          .filter((c) => c.id !== modal?.category?.id)
          .map((c) => c.name)}
        onSubmit={handleFormSubmit}
      />

      <DeleteCategoryDialog
        category={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <CategoryDetailSheet
        category={detailTarget}
        onOpenChange={(open) => !open && setDetailTarget(null)}
        onEdit={(category) => {
          setDetailTarget(null);
          openEdit(category);
        }}
        onDelete={(category) => {
          setDetailTarget(null);
          setDeleteTarget(category);
        }}
      />
    </div>
  );
}
