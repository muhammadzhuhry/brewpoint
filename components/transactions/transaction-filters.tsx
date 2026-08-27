"use client";

import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const DATE_RANGES = [
  { id: "today", label: "Today" },
  { id: "7days", label: "7 days" },
  { id: "30days", label: "30 days" },
] as const;

export function TransactionFilters({
  dateRange,
  onDateRangeChange,
  cashierFilter,
  onCashierFilterChange,
  cashiers,
  statusFilter,
  onStatusFilterChange,
  isAdmin,
}: {
  dateRange: "today" | "7days" | "30days";
  onDateRangeChange: (value: "today" | "7days" | "30days") => void;
  cashierFilter: string;
  onCashierFilterChange: (value: string) => void;
  cashiers: User[];
  statusFilter: "all" | "completed" | "voided";
  onStatusFilterChange: (filter: "all" | "completed" | "voided") => void;
  isAdmin: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-0.5 rounded-[9px] border border-border bg-background p-[3px]">
        {DATE_RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onDateRangeChange(r.id)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-[13px]",
              dateRange === r.id
                ? "bg-card font-semibold text-primary shadow-sm"
                : "font-medium text-muted-foreground",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {isAdmin && (
        <Select
          items={{
            "All cashiers": "All cashiers",
            ...Object.fromEntries(cashiers.map((c) => [c.id, c.name])),
          }}
          value={cashierFilter}
          onValueChange={(value) => value && onCashierFilterChange(value)}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All cashiers">All cashiers</SelectItem>
            {cashiers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex-1" />

      <div className="flex gap-0.5 rounded-[9px] border border-border bg-background p-[3px]">
        {(["all", "completed", "voided"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onStatusFilterChange(f)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-[13px] capitalize",
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
  );
}
