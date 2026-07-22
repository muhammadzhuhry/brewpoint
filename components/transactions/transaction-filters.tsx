"use client";

import { Calendar, ChevronDown, Search } from "lucide-react";

import { CASHIERS } from "@/lib/mock-transactions";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function TransactionFilters({
  search,
  onSearchChange,
  cashierFilter,
  onCashierFilterChange,
  statusFilter,
  onStatusFilterChange,
  isAdmin,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  cashierFilter: string | null;
  onCashierFilterChange: (value: string | null) => void;
  statusFilter: "all" | "completed" | "voided";
  onStatusFilterChange: (filter: "all" | "completed" | "voided") => void;
  isAdmin: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-65">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search receipt no…"
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-border bg-card px-3.5">
        <Calendar className="size-[15px] text-muted-foreground" />
        <span className="text-[13px] font-medium text-foreground">
          Jul 7 – Jul 8, 2026
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </div>

      {isAdmin && (
        <Select value={cashierFilter} onValueChange={onCashierFilterChange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CASHIERS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
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
