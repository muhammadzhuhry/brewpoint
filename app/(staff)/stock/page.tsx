"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Product } from "@/lib/types";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useUsers } from "@/hooks/use-users";
import { useStockAdjustments } from "@/hooks/use-stock-adjustments";
import { apiPost } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { getStockStatus } from "@/lib/product-status";

import { PageHeader } from "@/components/shared/page-header";
import { ProductPickerList } from "@/components/stock/product-picker-list";
import { ProductHeaderCard } from "@/components/stock/product-header-card";
import { AdjustmentForm } from "@/components/stock/adjustment-form";
import { AdjustmentHistory } from "@/components/stock/adjustment-history";
import { ConfirmAdjustmentDialog } from "@/components/stock/confirm-adjustment-dialog";

export default function StockPage() {
  const queryClient = useQueryClient();

  const { data: productsData } = useProducts({ pageSize: 1000 });
  const products = productsData?.items ?? [];

  const { data: categoriesData } = useCategories();
  const categoryNameById = Object.fromEntries(
    (categoriesData ?? []).map((cat) => [cat.id, cat.name]),
  );

  const { data: usersData } = useUsers();
  const adminNameById = Object.fromEntries(
    (usersData ?? []).map((u) => [u.id, u.name]),
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "low" | "out">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [adjType, setAdjType] = useState<"increase" | "decrease">("increase");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ qty?: string; reason?: string }>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const lowCount = products.filter(
    (p) => getStockStatus(p.stockQuantity) !== "in-stock",
  ).length;
  const outCount = products.filter((p) => p.stockQuantity === 0).length;

  const filtered = products.filter((p) => {
    const status = getStockStatus(p.stockQuantity);
    if (statusFilter === "low" && status !== "low-stock") return false;
    if (statusFilter === "out" && status !== "out-of-stock") return false;
    const q = search.trim().toLowerCase();
    return q === "" || p.name.toLowerCase().includes(q);
  });

  const selected = products.find((p) => p.id === selectedId) ?? null;
  const { data: historyForSelected = [] } = useStockAdjustments(selectedId);

  const selectProduct = (id: string) => {
    setSelectedId(id);
    setAdjType("increase");
    setQty("");
    setReason("");
    setErrors({});
  };

  const delta = () => {
    const q = parseInt(qty, 10);
    return isNaN(q) ? 0 : q;
  };

  const newLevel = () => {
    if (!selected) return 0;
    const d = delta();
    return adjType === "increase"
      ? selected.stockQuantity + d
      : Math.max(0, selected.stockQuantity - d);
  };

  const createMutation = useMutation({
    mutationFn: (body: {
      adjustmentType: "increase" | "decrease";
      quantity: number;
      reason: string;
    }) =>
      apiPost<Product>(
        `/products/${selected?.id}/stock-adjustments`,
        body,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: ["stock-adjustments", selectedId],
      });
      setConfirmOpen(false);
      setQty("");
      setReason("");
      setAdjType("increase");
      setErrors({});
      toast.success(
        `${adjType === "increase" ? "Added" : "Removed"} ${delta()} — ${selected?.name} now at ${newLevel()}`,
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to record adjustment",
      );
    },
  });

  const handleOpenConfirm = () => {
    if (!selected) return;
    const q = parseInt(qty, 10);
    const newErrors: { qty?: string; reason?: string } = {};
    if (!qty || isNaN(q) || q <= 0) {
      newErrors.qty = "Enter a quantity greater than 0.";
    }
    if (!reason.trim()) {
      newErrors.reason = "A reason is required for every adjustment.";
    }
    if (adjType === "decrease" && q > selected.stockQuantity) {
      newErrors.qty = `Can't remove more than current stock (${selected.stockQuantity}).`;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setConfirmOpen(true);
  };

  const handleConfirmAdjustment = () => {
    if (!selected) return;
    createMutation.mutate({
      adjustmentType: adjType,
      quantity: delta(),
      reason: reason.trim(),
    });
  };

  return (
    <div className="flex h-full flex-col">
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

      <div className="-mx-6 -mb-6 flex flex-1 overflow-hidden">
        <ProductPickerList
          products={filtered}
          categoryNameById={categoryNameById}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          selectedId={selectedId}
          onSelect={selectProduct}
        />

        <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Select a product to adjust its stock.
            </div>
          ) : (
            <>
              <ProductHeaderCard
                product={selected}
                categoryNameById={categoryNameById}
              />

              <AdjustmentForm
                adjType={adjType}
                onAdjTypeChange={setAdjType}
                qty={qty}
                onQtyChange={(value) => {
                  setQty(value);
                  setErrors({ ...errors, qty: undefined });
                }}
                reason={reason}
                onReasonChange={(value) => {
                  setReason(value);
                  setErrors({ ...errors, reason: undefined });
                }}
                errors={errors}
                currentStock={selected.stockQuantity}
                newLevel={newLevel()}
                onSubmit={handleOpenConfirm}
              />

              <AdjustmentHistory
                entries={historyForSelected}
                adminNameById={adminNameById}
              />
            </>
          )}
        </div>
      </div>

      <ConfirmAdjustmentDialog
        open={confirmOpen}
        product={selected}
        type={adjType}
        qty={delta()}
        reason={reason}
        newLevel={newLevel()}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmAdjustment}
      />
    </div>
  );
}
