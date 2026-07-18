"use client";

import { useState } from "react";
import { Plus, Search, RefreshCw } from "lucide-react";

import type { Product } from "@/lib/types";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { mockCurrentUser } from "@/lib/mock-current-user";
import type { ProductFormValues } from "@/lib/validators/product";

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
  const isAdmin = mockCurrentUser.role === "admin";

  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [nextId, setNextId] = useState(products.length + 1);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(
    "All categories",
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    product: Product | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [detailTarget, setDetailTarget] = useState<Product | null>(null);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filtered = products.filter((p) => {
    const matchesCategory =
      categoryFilter === "All categories" || p.category === categoryFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" || p.name.toLowerCase().includes(q) || p.barcode.includes(q);
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const reload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1100);
  };

  const openAddModal = () => setModal({ mode: "add", product: null });
  const openEditModal = (product: Product) =>
    setModal({ mode: "edit", product });
  const closeModal = () => setModal(null);

  const handleFormSubmit = (values: ProductFormValues, imageUrl?: string) => {
    const rec = {
      name: values.name.trim(),
      category: values.category,
      price: Number(values.price),
      stock: Number(values.stock),
      barcode: values.barcode?.trim() || "—",
      imageUrl,
    };
    if (modal?.mode === "edit" && modal.product) {
      const id = modal.product.id;
      setProducts(products.map((p) => (p.id === id ? { ...p, ...rec } : p)));
    } else {
      setProducts([{ id: nextId, txnCount: 0, ...rec }, ...products]);
      setNextId(nextId + 1);
    }
    closeModal();
  };

  const confirmDelete = () => {
    setProducts(products.filter((p) => p.id !== deleteTarget?.id));
    setDeleteTarget(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        count={`${products.length} ${products.length === 1 ? "product" : "products"}`}
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
            Cashier view — you can browse and search products, but only an
            admin can add, edit, or remove them.
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
            setCategoryFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All categories">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button variant="outline" size="icon" onClick={reload}>
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <ProductsTable
        loading={loading}
        isEmpty={products.length === 0}
        hasNoResults={products.length > 0 && filtered.length === 0}
        isAdmin={isAdmin}
        pageItems={pageItems}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        pageSize={PAGE_SIZE}
        filteredCount={filtered.length}
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
