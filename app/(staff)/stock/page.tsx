"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import type { StockAdjustment } from "@/lib/types";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { MOCK_STOCK_HISTORY } from "@/lib/mock-stock-history";
import { getStockStatus } from "@/lib/product-status";
import { mockCurrentUser } from "@/lib/mock-current-user";

import { PageHeader } from "@/components/shared/page-header";
import { ProductPickerList } from "@/components/stock/product-picker-list";
import { ProductHeaderCard } from "@/components/stock/product-header-card";
import { AdjustmentForm } from "@/components/stock/adjustment-form";
import { AdjustmentHistory } from "@/components/stock/adjustment-history";
import { ConfirmAdjustmentDialog } from "@/components/stock/confirm-adjustment-dialog";

function getAdjustmentTimeLabel() {
  return (
    "Today · " +
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  );
}

export default function StockPage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [stockHistory, setStockHistory] = useState(MOCK_STOCK_HISTORY);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "low" | "out">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<number | null>(
    products[0]?.id ?? null,
  );

  const [adjType, setAdjType] = useState<"increase" | "decrease">("increase");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ qty?: string; reason?: string }>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

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
  const historyForSelected = selected ? (stockHistory[selected.id] ?? []) : [];

  const selectProduct = (id: number) => {
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
      ? selected.stock + d
      : Math.max(0, selected.stock - d);
  };

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
    if (adjType === "decrease" && q > selected.stock) {
      newErrors.qty = `Can't remove more than current stock (${selected.stock}).`;
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
    const q = delta();
    const result = newLevel();
    const entry: StockAdjustment = {
      type: adjType,
      qty: q,
      reason: reason.trim(),
      by: mockCurrentUser.name,
      when: getAdjustmentTimeLabel(),
      result,
    };

    setProducts(
      products.map((p) => (p.id === selected.id ? { ...p, stock: result } : p)),
    );
    setStockHistory({
      ...stockHistory,
      [selected.id]: [entry, ...historyForSelected],
    });
    setConfirmOpen(false);
    setQty("");
    setReason("");
    setAdjType("increase");
    setErrors({});
    setToast(
      `${adjType === "increase" ? "Added" : "Removed"} ${q} — ${selected.name} now at ${result}`,
    );
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
              <ProductHeaderCard product={selected} />

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
                currentStock={selected.stock}
                newLevel={newLevel()}
                onSubmit={handleOpenConfirm}
              />

              <AdjustmentHistory entries={historyForSelected} />

              {toast && (
                <div className="sticky bottom-0 flex items-center gap-2.5 self-center rounded-[10px] bg-primary px-4 py-2.5 text-primary-foreground shadow-lg">
                  <Check className="size-4 text-[#8FE0A6]" />
                  <span className="text-[13.5px] font-medium">{toast}</span>
                </div>
              )}
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
