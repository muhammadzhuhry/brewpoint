"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Tag, Pencil, Trash2, Leaf } from "lucide-react";
import { toast } from "sonner";

import type { Category, CategoryWithProductCount } from "@/lib/types";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCategories } from "@/hooks/use-categories";
import { apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog";
import { CategoryDetailSheet } from "@/components/categories/category-detail-sheet";

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const { data } = useCategories();
  const categories = data ?? [];

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    category: Category | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string>();
  const [detailTarget, setDetailTarget] = useState<Category | null>(null);

  const openAdd = () => setModal({ mode: "add", category: null });
  const openEdit = (category: Category) =>
    setModal({ mode: "edit", category });
  const closeModal = () => setModal(null);

  const createMutation = useMutation({
    mutationFn: (name: string) => apiPost<Category>("/categories", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModal();
      toast.success("Category created");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to create category",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiPut<Category>(`/categories/${id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModal();
      toast.success("Category updated");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to update category",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete<Category>(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteTarget(null);
      setDeleteError(undefined);
      toast.success("Category deleted");
    },
    onError: (error) => {
      setDeleteError(
        error instanceof ApiError
          ? error.message
          : "Failed to delete category.",
      );
    },
  });

  const handleFormSubmit = (name: string) => {
    if (modal?.mode === "edit" && modal.category) {
      updateMutation.mutate({ id: modal.category.id, name });
    } else {
      createMutation.mutate(name);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        count={`${categories.length} ${categories.length === 1 ? "category" : "categories"}`}
        action={
          isAdmin && (
            <Button onClick={openAdd}>
              <Plus className="size-4" /> New category
            </Button>
          )
        }
      />

      {categories.length === 0 ? (
        <div className="flex min-h-[440px] items-center justify-center rounded-xl border border-border bg-card p-10">
          <EmptyState
            icon={<Leaf className="size-7" />}
            title="No categories yet"
            description="Create your first category to start organizing the menu — products get assigned to one."
            action={
              isAdmin && (
                <Button onClick={openAdd}>
                  <Plus className="size-4" /> Create your first category
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => setDetailTarget(category)}
              className="flex cursor-pointer flex-col gap-3.5 rounded-xl border border-border bg-card p-[18px]"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-[11px] bg-icon-chip-background">
                  <Tag className="size-5 text-icon-chip-foreground" />
                </div>
                {isAdmin && (
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
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-semibold text-primary">
                    {category.name}
                  </span>
                  {category.productCount === 0 && (
                    <Badge variant="neutral">Empty</Badge>
                  )}
                </div>
                <span className="text-[12.5px] tabular-nums text-muted-foreground">
                  {category.productCount === 0
                    ? "No products"
                    : `${category.productCount} products`}
                </span>
              </div>
            </div>
          ))}
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
        error={deleteError}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(undefined);
          }
        }}
        onConfirm={confirmDelete}
      />

      <CategoryDetailSheet
        category={detailTarget}
        isAdmin={isAdmin}
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
