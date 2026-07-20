"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import type { Product } from "@/lib/types";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { getStockStatus } from "@/lib/product-status";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { getTileColor } from "@/lib/avatar-color";

export default function StockPage() {
  const [products] = useState(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "low" | "out">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<number | null>(
    products[0]?.id ?? null,
  );

  const lowCount = products.filter(
    (p) => getStockStatus(p.stock) !== "in-stock",
  ).length;
  const outCount = products.filter((p) => p.stock === 0).length;

  const filtered = products.filter((p) => {
    const status = getStockStatus(p.stock);
    if (statusFilter === "low" && status !== "low-stock") return false;
    if (statusFilter === "out" && status !== "out-of-stock") return false;
    const q = search.trim().toLowerCase();
    return q === "" || p.name.toLowerCase().includes(q);
  });

  const selected = products.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="flex h-full flex-col gap-6">
      <PageHeader
        title="Stock"
        count={`${products.length} products tracked`}
        action={
          <div className="flex items-center gap-2 rounded-[9px] border border-[#F0DFBD] bg-warning-subtle px-3.5 py-2">
            <span className="text-[12.5px] font-semibold tabular-nums text-warning-subtle-foreground">
              {outCount > 0
                ? `${lowCount} need attention · ${outCount} out`
                : `${lowCount} need attention`}
            </span>
          </div>
        }
      />

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex w-[340px] shrink-0 flex-col rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-[#F1F0EC] p-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-0.5 rounded-[9px] border border-border bg-background p-[3px]">
              {(["all", "low", "out"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-[13px] capitalize",
                    statusFilter === f
                      ? "bg-card font-semibold text-primary shadow-sm"
                      : "font-medium text-muted-foreground",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-[13px] text-muted-foreground">
                No products match.
              </div>
            ) : (
              filtered.map((product) => {
                const isSelected = product.id === selectedId;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedId(product.id)}
                    className={cn(
                      "flex h-[62px] w-full items-center gap-3 border-b border-[#F1F0EC] border-l-[3px] px-4 text-left",
                      isSelected
                        ? "border-l-primary bg-icon-chip-background"
                        : "border-l-transparent hover:bg-[#FAFAF8]",
                    )}
                  >
                    <div
                      className="flex size-9.5 shrink-0 items-center justify-center rounded-[9px] font-display text-[15px] font-semibold"
                      style={{
                        backgroundColor: getTileColor(product.name)[0],
                        color: getTileColor(product.name)[1],
                      }}
                    >
                      {product.name[0]}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium text-foreground">
                        {product.name}
                      </span>
                      <span className="text-[11.5px] text-[#9AA1AB]">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={cn(
                          "tabular-nums text-[15px] font-semibold",
                          product.stock === 0
                            ? "text-destructive"
                            : "text-primary",
                        )}
                      >
                        {product.stock}
                      </span>
                      <span
                        className={cn(
                          "size-[7px] rounded-full",
                          getStockStatus(product.stock) === "out-of-stock"
                            ? "bg-destructive"
                            : getStockStatus(product.stock) === "low-stock"
                              ? "bg-warning"
                              : "bg-success",
                        )}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {/* panel kanan (adjust form + history) nanti di sini */}
        </div>
      </div>
    </div>
  );
}
