"use client";

import {
  Calendar,
  Clock,
  Coffee,
  Cookie,
  LayoutGrid,
  Leaf,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  All: LayoutGrid,
  Espresso: Coffee,
  "Brewed Coffee": Coffee,
  "Non-Coffee": Leaf,
  Pastry: Cookie,
  "Seasonal Drinks": Sparkles,
};

export function CheckoutHeader({
  dateLabel,
  timeLabel,
  search,
  onSearchChange,
  sort,
  onSortChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  products,
}: {
  dateLabel: string;
  timeLabel: string;
  search: string;
  onSearchChange: (value: string) => void;
  sort: string | null;
  onSortChange: (value: string | null) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categories: string[];
  products: Product[];
}) {
  return (
    <div className="flex flex-col gap-3.5 px-6 pt-5 pb-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-primary">
            Checkout
          </h1>
          <span className="text-[12.5px] text-[#8A8577]">
            New sale · Shift 7:00 AM – 3:00 PM
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5">
            <Calendar className="size-[17px] text-muted-foreground" />
            <div className="flex flex-col leading-tight">
              <span className="text-[9.5px] font-semibold tracking-wide text-muted-foreground">
                DATE
              </span>
              <span className="text-[13.5px] font-semibold tabular-nums text-primary">
                {dateLabel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-primary px-4 py-2.5">
            <Clock className="size-[17px] text-secondary" />
            <div className="flex flex-col leading-tight">
              <span className="text-[9.5px] font-semibold tracking-wide text-secondary/70">
                TIME
              </span>
              <span className="text-sm font-semibold tabular-nums text-primary-foreground">
                {timeLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products or scan barcode…"
            className="h-12 w-full rounded-xl border border-border bg-card pr-3.5 pl-10 text-[15px] text-foreground outline-none"
          />
        </div>

        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="h-12 w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sort: Popular">Sort: Popular</SelectItem>
            <SelectItem value="Name A–Z">Name A–Z</SelectItem>
            <SelectItem value="Price: Low to high">
              Price: Low to high
            </SelectItem>
            <SelectItem value="Price: High to low">
              Price: High to low
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {["All", ...categories].map((c) => {
          const isOn = categoryFilter === c;
          const count =
            c === "All"
              ? products.length
              : products.filter((p) => p.category === c).length;
          const Icon = CATEGORY_ICONS[c] ?? Coffee;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onCategoryFilterChange(c)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-1.5 text-[13.5px] font-medium whitespace-nowrap",
                isOn
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full",
                  isOn ? "bg-white/20" : "bg-icon-chip-background",
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5",
                    isOn ? "text-secondary" : "text-primary",
                  )}
                />
              </span>
              {c}
              <span
                className={cn(
                  "flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                  isOn
                    ? "bg-white/15 text-primary-foreground"
                    : "bg-[#F1F0EC] text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
