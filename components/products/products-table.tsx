"use client";

import { ChevronLeft, ChevronRight, Coffee, Pencil, Search, Trash2, Plus } from "lucide-react";

import type { Product } from "@/lib/types";
import { getStockStatus } from "@/lib/product-status";
import { getTileColor } from "@/lib/avatar-color";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function ProductsTable({
  loading,
  isEmpty,
  hasNoResults,
  isAdmin,
  pageItems,
  currentPage,
  totalPages,
  startIndex,
  pageSize,
  filteredCount,
  onPageChange,
  onRowClick,
  onEdit,
  onDelete,
  onAddFirst,
}: {
  loading: boolean;
  isEmpty: boolean;
  hasNoResults: boolean;
  isAdmin: boolean;
  pageItems: Product[];
  currentPage: number;
  totalPages: number;
  startIndex: number;
  pageSize: number;
  filteredCount: number;
  onPageChange: (page: number) => void;
  onRowClick: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddFirst: () => void;
}) {
  return (
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
      ) : isEmpty ? (
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
                <Button onClick={onAddFirst}>
                  <Plus className="size-4" /> Add your first product
                </Button>
              )
            }
          />
        </div>
      ) : hasNoResults ? (
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
                  onClick={() => onRowClick(product)}
                  className={cn(
                    "h-15.5 cursor-pointer",
                    getStockStatus(product.stock) === "out-of-stock"
                      ? "bg-[#FCF7F6] hover:bg-[#FBF1EF]"
                      : "hover:bg-[#FAFAF8]",
                  )}
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
                            onEdit(product);
                          }}
                          className="flex size-8 items-center justify-center rounded-lg border border-border bg-card"
                        >
                          <Pencil className="size-[15px] text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(product);
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
              {Math.min(startIndex + pageSize, filteredCount)} of{" "}
              {filteredCount} products
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="flex h-[34px] min-w-[34px] items-center justify-center rounded-md border border-border bg-card px-1.5 text-[13px] font-medium text-foreground disabled:cursor-not-allowed disabled:text-[#C7CCD1]"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPageChange(p)}
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
                onClick={() => onPageChange(currentPage + 1)}
                className="flex h-[34px] min-w-[34px] items-center justify-center rounded-md border border-border bg-card px-1.5 text-[13px] font-medium text-foreground disabled:cursor-not-allowed disabled:text-[#C7CCD1]"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
