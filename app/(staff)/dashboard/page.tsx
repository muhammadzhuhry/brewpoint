"use client";

import { useState, type ReactNode } from "react";
import { Calendar, Coffee, DollarSign, Receipt, Tag } from "lucide-react";

import {
  MOCK_DASHBOARD,
  type DashboardPeriod,
  type StatDelta,
} from "@/lib/mock-dashboard";
import { mockCurrentUser } from "@/lib/mock-current-user";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon,
  delta,
  deltaNote,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  delta: StatDelta;
  deltaNote: string;
}) {
  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-4.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted-foreground">
          {label}
        </span>
        <div className="flex size-8 items-center justify-center rounded-lg bg-icon-chip-background text-primary">
          {icon}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-display text-[28px] font-semibold tracking-tight tabular-nums text-primary">
          {value}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
              delta.up
                ? "bg-success-subtle text-success-subtle-foreground"
                : "bg-destructive-subtle text-destructive-subtle-foreground",
            )}
          >
            {delta.text}
          </span>
          <span className="text-xs text-muted-foreground">{deltaNote}</span>
        </div>
      </div>
    </div>
  );
}

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

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total sales"
          value={snapshot.stats.sales}
          icon={<DollarSign className="size-4" />}
          delta={snapshot.deltas.sales}
          deltaNote={snapshot.deltaNote}
        />
        <StatCard
          label="Transactions"
          value={snapshot.stats.txns}
          icon={<Receipt className="size-4" />}
          delta={snapshot.deltas.txns}
          deltaNote={snapshot.deltaNote}
        />
        <StatCard
          label="Avg. ticket"
          value={snapshot.stats.avg}
          icon={<Tag className="size-4" />}
          delta={snapshot.deltas.avg}
          deltaNote={snapshot.deltaNote}
        />
        <StatCard
          label="Items sold"
          value={snapshot.stats.items}
          icon={<Coffee className="size-4" />}
          delta={snapshot.deltas.items}
          deltaNote={snapshot.deltaNote}
        />
      </div>
    </div>
  );
}
