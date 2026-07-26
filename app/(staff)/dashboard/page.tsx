"use client";

import { useState, type ReactNode } from "react";
import {
  Calendar,
  Coffee,
  DollarSign,
  Receipt,
  Tag,
  AlertTriangle,
  PieChart,
} from "lucide-react";

import {
  MOCK_DASHBOARD,
  type DashboardPeriod,
  type StatDelta,
} from "@/lib/mock-dashboard";
import { mockCurrentUser } from "@/lib/mock-current-user";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { getStockStatus } from "@/lib/product-status";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from "recharts";

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

  const maxBarValue = Math.max(...snapshot.bars.map((b) => b.value));
  const maxBestSellerQty = snapshot.bestSellers[0]?.qty ?? 1;

  const lowStockProducts = [...MOCK_PRODUCTS]
    .filter((p) => getStockStatus(p.stock) !== "in-stock")
    .sort((a, b) => a.stock - b.stock);

  const hasNoSales = snapshot.bars.every((bar) => bar.value === 0);
  const periodLabel =
    period === "today"
      ? "today"
      : period === "week"
        ? "the last 7 days"
        : "the last 30 days";

  return (
    <div className="flex flex-col gap-6">
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

      {hasNoSales ? (
        <div className="flex flex-1 items-center justify-center p-16">
          <EmptyState
            icon={<PieChart className="size-7" />}
            title="No sales yet"
            description={`No transactions recorded for ${periodLabel}.`}
          />
        </div>
      ) : (
        <>
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

          <div className="grid grid-cols-[1fr_550px] items-stretch gap-4">
            <div className="flex flex-col gap-[18px] rounded-xl border border-border bg-card p-5">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-base font-semibold text-primary">
                  {snapshot.chartTitle}
                </h3>
                <span className="text-[12.5px] text-muted-foreground">
                  {snapshot.chartMeta}
                </span>
              </div>
              <div className="h-65">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={snapshot.bars}>
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9AA1AB" }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {snapshot.bars.map((bar, i) => (
                        <Cell
                          key={i}
                          fill={
                            bar.value >= maxBarValue * 0.82
                              ? "#2B3A4A"
                              : "#9DB4CE"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-[550px] rounded-xl border border-border bg-card p-5">
              <div className="mb-1.5 flex items-baseline justify-between">
                <h3 className="font-display text-base font-semibold text-primary">
                  Best sellers
                </h3>
                <span className="text-xs text-muted-foreground">by units</span>
              </div>
              <div className="flex flex-col">
                {snapshot.bestSellers.map((item, i) => (
                  <div
                    key={item.name}
                    className={cn(
                      "flex items-center gap-3 py-2.5",
                      i < snapshot.bestSellers.length - 1 &&
                        "border-b border-[#F1F0EC]",
                    )}
                  >
                    <span className="w-4.5 text-[13px] font-semibold tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[13.5px] font-medium text-foreground">
                          {item.name}
                        </span>
                        <span className="text-[13.5px] font-semibold tabular-nums text-primary">
                          {item.qty}
                        </span>
                      </div>
                      <div className="h-[5px] overflow-hidden rounded-full bg-[#F1EEE8]">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{
                            width: `${(item.qty / maxBestSellerQty) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_600px] items-stretch gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2.5 flex items-baseline justify-between">
                <h3 className="font-display text-base font-semibold text-primary">
                  Sales by category
                </h3>
                <span className="text-[12.5px] text-muted-foreground">
                  share of {snapshot.stats.sales}
                </span>
              </div>
              <div className="flex flex-col gap-3.5">
                {snapshot.categoryBreakdown.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="w-27.5 shrink-0 text-[13px] font-medium text-foreground">
                      {cat.name}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F1EEE8]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cat.percent}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                    <span className="w-9.5 shrink-0 text-right text-[13px] font-semibold tabular-nums text-primary">
                      {cat.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-[600px] rounded-xl border border-border bg-card p-5">
              <div className="mb-2.5 flex items-center gap-2">
                <AlertTriangle className="size-4 text-warning" />
                <h3 className="font-display text-base font-semibold text-primary">
                  Low stock
                </h3>
              </div>
              <div className="flex flex-col">
                {lowStockProducts.map((product, i) => {
                  const isOut =
                    getStockStatus(product.stock) === "out-of-stock";
                  return (
                    <div
                      key={product.id}
                      className={cn(
                        "flex items-center justify-between py-2.5",
                        i < lowStockProducts.length - 1 &&
                          "border-b border-[#F1F0EC]",
                      )}
                    >
                      <span className="text-[13.5px] font-medium text-foreground">
                        {product.name}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          isOut
                            ? "bg-destructive-subtle text-destructive-subtle-foreground"
                            : "bg-warning-subtle text-warning-subtle-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            isOut ? "bg-destructive" : "bg-warning",
                          )}
                        />
                        {isOut ? "Out of stock" : `${product.stock} left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
