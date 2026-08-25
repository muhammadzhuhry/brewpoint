"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, Search, RefreshCw } from "lucide-react";

import type { Product } from "@/lib/types";
import type { ProductFormValues } from "@/lib/validators/product";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { apiPost, apiPut, apiDelete } from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { ProductsTable } from "@/components/products/products-table";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
import { ProductDetailSheet } from "@/components/products/product-detail-sheet";

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const { data: categoriesData } = useCategories();
  const categories = categoriesData ?? [];
  const categoryNameById = Object.fromEntries(
    categories.map((cat) => [cat.id, cat.name]),
  );

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<string>("All categories");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    product: Product | null;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [detailTarget, setDetailTarget] = useState<Product | null>(null);

  const { data, isLoading, isFetching, refetch } = useProducts({
    search: search || undefined,
    categoryId:
      categoryFilter === "All categories" ? undefined : categoryFilter,
    page,
  });

  const products = data?.items ?? [];
  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / data.pageSize))
    : 1;
  const currentPage = data?.page ?? page;
  const startIndex = data ? (data.page - 1) * data.pageSize : 0;

  const createMutation = useMutation({
    mutationFn: (body: {
      name: string;
      categoryId: string;
      price: string;
      stockQuantity: number;
      barcode?: string;
      imageUrl?: string;
    }) => apiPost<Product>("/products", body),
    onSuccess: () => closeModal(),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        name: string;
        categoryId: string;
        price: string;
        stockQuantity: number;
        barcode?: string;
        imageUrl?: string;
      };
    }) => apiPut<Product>(`/products/${id}`, body),
    onSuccess: () => closeModal(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete<Product>(`/products/${id}`),
    onSuccess: () => setDeleteTarget(null),
  });

  const openAddModal = () => setModal({ mode: "add", product: null });
  const openEditModal = (product: Product) =>
    setModal({ mode: "edit", product });
  const closeModal = () => setModal(null);

  const handleFormSubmit = (values: ProductFormValues, imageUrl?: string) => {
    const body = {
      name: values.name.trim(),
      categoryId: values.categoryId,
      price: values.price,
      stockQuantity: Number(values.stock),
      barcode: values.barcode?.trim() || undefined,
      imageUrl,
    };
    if (modal?.mode === "edit" && modal.product) {
      updateMutation.mutate({ id: modal.product.id, body });
    } else {
      createMutation.mutate(body);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  };

  const hasActiveFilter =
    search.trim() !== "" || categoryFilter !== "All categories";
  const totalCount = data?.total ?? 0;
  const isEmpty = !hasActiveFilter && totalCount === 0;
  const hasNoResults = hasActiveFilter && totalCount === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        count={`${data?.total ?? 0} ${data?.total === 1 ? "product" : "products"}`}
        action={
          isAdmin && (
            <Button onClick={openAddModal}>
              <Plus className="size-4" /> Add product
            </Button>
          )
        }
      />

      {!isAdmin && (
        <div className="flex items-center gap-2.5 rounded-[10px] border border-[#CFE0F0] bg-[#E7EFF7] px-3.5 py-2.5">
          <span className="text-sm font-medium text-[#3A6BA8]">
            Cashier view — you can browse and search products, but only an admin
            can add, edit, or remove them.
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or barcode…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            if (value) {
              setCategoryFilter(value);
              setPage(1);
            }
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All categories">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <ProductsTable
        loading={isLoading || isFetching}
        isEmpty={isEmpty}
        hasNoResults={hasNoResults}
        isAdmin={isAdmin}
        pageItems={products}
        categoryNameById={categoryNameById}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        pageSize={data?.pageSize ?? PAGE_SIZE}
        filteredCount={totalCount}
        onPageChange={setPage}
        onRowClick={setDetailTarget}
        onEdit={openEditModal}
        onDelete={setDeleteTarget}
        onAddFirst={openAddModal}
      />

      <ProductFormDialog
        open={modal !== null}
        onOpenChange={(open) => !open && closeModal()}
        mode={modal?.mode ?? "add"}
        product={modal?.product ?? null}
        categories={categories}
        onSubmit={handleFormSubmit}
      />

      <DeleteProductDialog
        product={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <ProductDetailSheet
        product={detailTarget}
        categoryNameById={categoryNameById}
        onOpenChange={(open) => !open && setDetailTarget(null)}
        isAdmin={isAdmin}
        onEdit={(product) => {
          setDetailTarget(null);
          openEditModal(product);
        }}
        onDelete={(product) => {
          setDetailTarget(null);
          setDeleteTarget(product);
        }}
      />
    </div>
  );
}
