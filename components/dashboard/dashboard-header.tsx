"use client";

import { Calendar } from "lucide-react";

import type { DashboardPeriod } from "@/lib/mock-dashboard";
import { mockCurrentUser } from "@/lib/mock-current-user";
import { cn } from "@/lib/utils";

export function DashboardHeader({
  period,
  onPeriodChange,
  dateLabel,
}: {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  dateLabel: string;
}) {
  return (
    <div className="-mx-6 -mt-6 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-display text-2xl font-semibold text-primary">
          Dashboard
        </h1>
        <span className="text-xs text-muted-foreground">
          Good morning, {mockCurrentUser.name} — here&apos;s how the shop is
          doing.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-0.5 rounded-[10px] border border-border bg-background p-[3px]">
          {(["today", "week", "month"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-[13px]",
                period === p
                  ? "bg-card font-semibold text-primary shadow-sm"
                  : "font-medium text-muted-foreground",
              )}
            >
              {p === "today" ? "Today" : p === "week" ? "7 days" : "30 days"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-[10px] border border-border bg-card px-3.5 py-2">
          <Calendar className="size-[15px] text-muted-foreground" />
          <span className="text-[13px] font-medium tabular-nums text-foreground">
            {dateLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
