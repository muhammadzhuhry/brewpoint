"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

import { MOCK_DASHBOARD, type DashboardPeriod } from "@/lib/mock-dashboard";
import { mockCurrentUser } from "@/lib/mock-current-user";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const snapshot = MOCK_DASHBOARD[period];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
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
                onClick={() => setPeriod(p)}
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
              {snapshot.dateLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
