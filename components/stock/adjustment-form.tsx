"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const PRESET_REASONS = [
  "Weekly delivery",
  "Inventory recount",
  "Spoilage / waste",
  "Damaged in transit",
  "Transfer to storage",
];

export function AdjustmentForm({
  adjType,
  onAdjTypeChange,
  qty,
  onQtyChange,
  reason,
  onReasonChange,
  errors,
  currentStock,
  newLevel,
  onSubmit,
}: {
  adjType: "increase" | "decrease";
  onAdjTypeChange: (type: "increase" | "decrease") => void;
  qty: string;
  onQtyChange: (value: string) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  errors: { qty?: string; reason?: string };
  currentStock: number;
  newLevel: number;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col gap-[18px] rounded-xl border border-border bg-card p-[22px]">
      <h3 className="font-display text-base font-semibold text-primary">
        Adjust stock
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Adjustment type
          </label>
          <div className="flex gap-0.5 rounded-[10px] border border-border bg-background p-[3px]">
            <button
              type="button"
              onClick={() => onAdjTypeChange("increase")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-[9px] text-sm",
                adjType === "increase"
                  ? "bg-card font-semibold text-success shadow-sm"
                  : "font-medium text-muted-foreground",
              )}
            >
              <ArrowUp className="size-[15px]" />
              Increase
            </button>
            <button
              type="button"
              onClick={() => onAdjTypeChange("decrease")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-[9px] text-sm",
                adjType === "decrease"
                  ? "bg-card font-semibold text-destructive shadow-sm"
                  : "font-medium text-muted-foreground",
              )}
            >
              <ArrowDown className="size-[15px]" />
              Decrease
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Quantity
          </label>
          <Input
            value={qty}
            onChange={(e) => onQtyChange(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            className={cn("tabular-nums", errors.qty && "border-destructive")}
          />
          {errors.qty && (
            <span className="text-xs text-destructive">{errors.qty}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          Reason <span className="text-destructive">· required</span>
        </label>
        <div className="flex flex-wrap gap-[7px]">
          {PRESET_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onReasonChange(r)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12.5px] font-medium",
                reason === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <Textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Pick a reason above or type your own…"
          className={cn(
            "h-[60px] resize-none",
            errors.reason && "border-destructive",
          )}
        />
        {errors.reason && (
          <span className="text-xs text-destructive">{errors.reason}</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 rounded-[10px] bg-icon-chip-background px-4 py-2.5">
          <span className="text-[13px] font-medium text-icon-chip-foreground">
            New level
          </span>
          <span className="text-base font-semibold tabular-nums text-primary">
            {qty ? `${currentStock} → ${newLevel}` : "—"}
          </span>
        </div>
        <Button onClick={onSubmit}>Record adjustment</Button>
      </div>
    </div>
  );
}
