"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Upload,
  Pencil,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Coffee,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

import { mockCurrentUser } from "@/lib/mock-current-user";
import { getTileColor } from "@/lib/avatar-color";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode: string;
  txnCount: number;
  imageUrl?: string;
};

function getStockStatus(
  stock: number,
): "out-of-stock" | "low-stock" | "in-stock" {
  if (stock === 0) return "out-of-stock";
  if (stock <= 8) return "low-stock";
  return "in-stock";
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Cappuccino",
    category: "Espresso",
    price: 4.25,
    stock: 36,
    barcode: "7850021401",
    txnCount: 214,
  },
  {
    id: 2,
    name: "Caffè Latte",
    category: "Espresso",
    price: 4.75,
    stock: 41,
    barcode: "7850021418",
    txnCount: 288,
  },
  {
    id: 3,
    name: "Flat White",
    category: "Espresso",
    price: 4.5,
    stock: 22,
    barcode: "7850021425",
    txnCount: 132,
  },
  {
    id: 4,
    name: "Americano",
    category: "Espresso",
    price: 3.5,
    stock: 58,
    barcode: "7850021432",
    txnCount: 176,
  },
  {
    id: 5,
    name: "Cortado",
    category: "Espresso",
    price: 4.0,
    stock: 7,
    barcode: "7850021449",
    txnCount: 54,
  },
  {
    id: 6,
    name: "Cold Brew",
    category: "Brewed Coffee",
    price: 4.95,
    stock: 0,
    barcode: "7850021456",
    txnCount: 121,
  },
  {
    id: 7,
    name: "Nitro Cold Brew",
    category: "Brewed Coffee",
    price: 5.75,
    stock: 14,
    barcode: "7850021463",
    txnCount: 88,
  },
  {
    id: 8,
    name: "Pour Over",
    category: "Brewed Coffee",
    price: 5.5,
    stock: 8,
    barcode: "7850021470",
    txnCount: 41,
  },
  {
    id: 9,
    name: "Matcha Latte",
    category: "Non-Coffee",
    price: 5.25,
    stock: 28,
    barcode: "7850021487",
    txnCount: 96,
  },
  {
    id: 10,
    name: "Butter Croissant",
    category: "Pastry",
    price: 3.75,
    stock: 18,
    barcode: "7850021517",
    txnCount: 162,
  },
  {
    id: 11,
    name: "Almond Croissant",
    category: "Pastry",
    price: 4.5,
    stock: 4,
    barcode: "7850021524",
    txnCount: 58,
  },
  {
    id: 12,
    name: "Blueberry Muffin",
    category: "Pastry",
    price: 3.95,
    stock: 0,
    barcode: "7850021531",
    txnCount: 39,
  },
];

const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required."),
  category: z.string().min(1, "Choose a category."),
  price: z
    .string()
    .min(1, "Price is required.")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0,
      "Enter a valid price (0 or more).",
    ),
  stock: z
    .string()
    .min(1, "Stock quantity is required.")
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) >= 0,
      "Enter a whole number (0 or more).",
    ),
  barcode: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const isAdmin = mockCurrentUser.role === "admin";

  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(
    "All categories",
  );
  const [nextId, setNextId] = useState(products.length + 1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filtered = products.filter((p) => {
    const matchesCategory =
      categoryFilter === "All categories" || p.category === categoryFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" || p.name.toLowerCase().includes(q) || p.barcode.includes(q);
    return matchesCategory && matchesSearch;
  });

  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    id?: number;
  } | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      stock: "",
      barcode: "",
    },
  });

  const openAddModal = () => {
    form.reset({ name: "", category: "", price: "", stock: "", barcode: "" });
    setModal({ mode: "add" });
    setImagePreview(null);
  };

  const openEditModal = (product: Product) => {
    form.reset({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      barcode: product.barcode,
    });
    setModal({ mode: "edit", id: product.id });
    setImagePreview(product.imageUrl || null);
  };

  const closeModal = () => setModal(null);

  const onSubmit = (values: ProductFormValues) => {
    const rec = {
      name: values.name.trim(),
      category: values.category,
      price: Number(values.price),
      stock: Number(values.stock),
      barcode: values.barcode?.trim() || "—",
    };
    if (modal?.mode === "edit") {
      setProducts(
        products.map((p) => (p.id === modal.id ? { ...p, ...rec } : p)),
      );
    } else {
      setProducts([{ id: nextId, txnCount: 0, ...rec }, ...products]);
      setNextId(nextId + 1);
    }
    closeModal();
  };

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const hasHistory = deleteTarget ? deleteTarget.txnCount > 0 : false;

  const askDelete = (product: Product) => setDeleteTarget(product);
  const cancelDelete = () => setDeleteTarget(null);
  const confirmDelete = () => {
    setProducts(products.filter((p) => p.id !== deleteTarget?.id));
    setDeleteTarget(null);
  };

  const [loading, setLoading] = useState(false);

  const reload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1100);
  };

  const [detailTarget, setDetailTarget] = useState<Product | null>(null);
  const [tileBg, tileFg] = detailTarget
    ? getTileColor(detailTarget.name)
    : ["#EFEFEF", "#6B7280"];

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

      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex flex-col">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="flex h-15.5 items-center gap-3.5 border-b border-[#F1F0EC] px-4.5"
              >
                <Skeleton className="size-10 shrink-0 rounded-[9px]" />
                <div className="flex flex-1 flex-col gap-1.75">
                  <Skeleton className="h-3 w-[42%]" />
                  <Skeleton className="h-3 w-[22%]" />
                </div>
                <Skeleton className="h-3 w-13.5" />
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-5.5 w-21 rounded-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[420px] items-center justify-center p-10">
            <EmptyState
              icon={<Coffee className="size-7" />}
              title="No products yet"
              description={
                isAdmin
                  ? "Add your first product to start selling it on the POS screen."
                  : "No products have been added yet. Ask an admin to add the first one."
              }
              action={
                isAdmin && (
                  <Button onClick={openAddModal}>
                    <Plus className="size-4" /> Add your first product
                  </Button>
                )
              }
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[420px] items-center justify-center p-10">
            <EmptyState
              icon={<Search className="size-7" />}
              title="No matching products"
              description="No products match your search or filter. Try a different term or clear the category filter."
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((product) => (
                  <TableRow
                    key={product.id}
                    onClick={() => setDetailTarget(product)}
                    className="h-15.5 cursor-pointer hover:bg-[#FAFAF8]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-10 shrink-0 items-center justify-center rounded-[9px] font-display text-[15px] font-semibold"
                          style={{
                            backgroundColor: getTileColor(product.name)[0],
                            color: getTileColor(product.name)[1],
                            opacity:
                              getStockStatus(product.stock) === "out-of-stock"
                                ? 0.55
                                : 1,
                          }}
                        >
                          {product.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {product.barcode}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      ${product.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {product.stock}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={getStockStatus(product.stock)} />
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(product);
                            }}
                            className="flex size-8 items-center justify-center rounded-lg border border-border bg-card"
                          >
                            <Pencil className="size-[15px] text-muted-foreground" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              askDelete(product);
                            }}
                            className="flex size-8 items-center justify-center rounded-lg border border-border bg-card"
                          >
                            <Trash2 className="size-[15px] text-destructive" />
                          </button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="text-[13px] tabular-nums text-muted-foreground">
                Showing {startIndex + 1}–
                {Math.min(startIndex + PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length} products
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="flex h-[34px] min-w-[34px] items-center justify-center rounded-md border border-border bg-card px-1.5 text-[13px] font-medium text-foreground disabled:cursor-not-allowed disabled:text-[#C7CCD1]"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={cn(
                        "flex h-[34px] min-w-[34px] items-center justify-center rounded-md px-1.5 text-[13px]",
                        p === currentPage
                          ? "bg-primary font-semibold text-primary-foreground"
                          : "border border-border bg-card font-medium text-foreground",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className="flex h-[34px] min-w-[34px] items-center justify-center rounded-md border border-border bg-card px-1.5 text-[13px] font-medium text-foreground disabled:cursor-not-allowed disabled:text-[#C7CCD1]"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={modal !== null}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {modal?.mode === "edit" ? "Edit product" : "Add product"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4.5 px-6 py-6"
          >
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-name">
                    Product name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="product-name"
                    placeholder="e.g. Iced Caramel Macchiato"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-category">
                      Category <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="product-category"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select a category…" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="barcode"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="product-barcode">
                      Barcode{" "}
                      <span className="font-normal text-muted-foreground">
                        · optional
                      </span>
                    </FieldLabel>
                    <Input
                      id="product-barcode"
                      placeholder="e.g. 785002147"
                      className="tabular-nums"
                      {...field}
                    />
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-price">
                      Price (USD) <span className="text-destructive">*</span>
                    </FieldLabel>
                    <div className="relative">
                      <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="product-price"
                        placeholder="0.00"
                        className="pl-6 tabular-nums"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                    </div>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="stock"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-stock">
                      Stock quantity <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="product-stock"
                      placeholder="0"
                      className="tabular-nums"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Field>
              <FieldLabel>
                Product image{" "}
                <span className="font-normal text-muted-foreground">
                  · optional
                </span>
              </FieldLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="size-14 rounded-lg object-cover"
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-left text-sm font-medium text-accent"
                    >
                      Change image
                    </button>
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="text-left text-xs text-muted-foreground"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#C7CCD1] bg-[repeating-linear-gradient(45deg,#F7F5F1,#F7F5F1_10px,#F1EEE8_10px,#F1EEE8_20px)] p-5"
                >
                  <Upload className="size-[22px] text-muted-foreground" />
                  <span className="text-[13px] font-medium text-muted-foreground">
                    Drop an image or <span className="text-accent">browse</span>
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground/70">
                    PNG / JPG · up to 2MB
                  </span>
                </div>
              )}
            </Field>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)}>
              {modal?.mode === "edit" ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && cancelDelete()}
      >
        <DialogContent className="max-w-[420px]" showCloseButton={false}>
          <div className="flex flex-col gap-4 p-6">
            <div className="flex size-[46px] items-center justify-center rounded-[11px] bg-destructive-subtle">
              <Trash2 className="size-[22px] text-destructive" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="font-display text-lg font-semibold text-primary">
                Delete &quot;{deleteTarget?.name}&quot;?
              </h3>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                {hasHistory
                  ? "This product has sales history, so it will be soft-deleted — removed from the catalog but retained for reporting."
                  : "This product has no sales history and will be permanently removed from the catalog."}
              </p>
            </div>

            {hasHistory && (
              <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F0DFBD] bg-warning-subtle p-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-subtle-foreground" />
                <span className="text-[12.5px] leading-relaxed text-warning-subtle-foreground">
                  This product appears in{" "}
                  <strong>{deleteTarget?.txnCount}</strong> past transactions.
                  It will be hidden from the catalog but kept for reporting
                  (soft delete).
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2.5">
              <Button variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet
        open={detailTarget !== null}
        onOpenChange={(open) => !open && setDetailTarget(null)}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Product detail</SheetTitle>
          </SheetHeader>

          {detailTarget && (
            <div className="flex flex-1 flex-col gap-4.5 overflow-auto px-6 py-6">
              <div className="flex items-center gap-4">
                <div
                  className="flex size-18 shrink-0 items-center justify-center rounded-2xl font-display text-[30px] font-semibold"
                  style={{
                    backgroundColor: tileBg,
                    color: tileFg,
                    opacity:
                      getStockStatus(detailTarget.stock) === "out-of-stock"
                        ? 0.6
                        : 1,
                  }}
                >
                  {detailTarget.name[0]}
                </div>
                <div className="flex flex-col gap-1.75">
                  <span className="font-display text-xl font-semibold text-primary">
                    {detailTarget.name}
                  </span>
                  <StatusBadge status={getStockStatus(detailTarget.stock)} />
                </div>
              </div>

              <div className="flex flex-col gap-3.5">
                {[
                  ["CATEGORY", detailTarget.category],
                  ["PRICE", `$${detailTarget.price.toFixed(2)}`],
                  [
                    "STOCK QUANTITY",
                    detailTarget.stock === 0
                      ? "0 — out of stock"
                      : `${detailTarget.stock} units`,
                  ],
                  ["BARCODE", detailTarget.barcode],
                  ["SOLD IN", `${detailTarget.txnCount} transactions`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1 border-b border-[#F1F0EC] pb-3.5"
                  >
                    <span className="text-[11.5px] font-semibold tracking-wide text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-[15px] font-medium tabular-nums text-foreground">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {getStockStatus(detailTarget.stock) === "out-of-stock" && (
                <div className="flex items-center gap-2.5 rounded-[10px] border border-[#EBC6C1] bg-destructive-subtle px-3.5 py-2.5">
                  <AlertCircle className="size-4 shrink-0 text-destructive-subtle-foreground" />
                  <span className="text-[12.5px] font-medium text-destructive-subtle-foreground">
                    Out of stock — not sellable on the POS until restocked.
                  </span>
                </div>
              )}
            </div>
          )}

          {isAdmin && (
            <SheetFooter>
              <Button
                className="flex-1"
                onClick={() => {
                  if (detailTarget) openEditModal(detailTarget);
                  setDetailTarget(null);
                }}
              >
                <Pencil className="size-4" />
                Edit
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
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
