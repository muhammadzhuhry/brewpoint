"use client";

import { useState } from "react";
import { PieChart } from "lucide-react";

import { MOCK_DASHBOARD, type DashboardPeriod } from "@/lib/mock-dashboard";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { BestSellers } from "@/components/dashboard/best-sellers";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { LowStock } from "@/components/dashboard/low-stock";

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const snapshot = MOCK_DASHBOARD[period];

  const hasNoSales = snapshot.bars.every((bar) => bar.value === 0);
  const periodLabel =
    period === "today"
      ? "today"
      : period === "week"
        ? "the last 7 days"
        : "the last 30 days";

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        period={period}
        onPeriodChange={setPeriod}
        dateLabel={snapshot.dateLabel}
      />

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
          <StatsGrid snapshot={snapshot} />

          <div className="grid grid-cols-[1fr_550px] items-stretch gap-4">
            <SalesChart snapshot={snapshot} />
            <BestSellers snapshot={snapshot} />
          </div>

          <div className="grid grid-cols-[1fr_600px] items-stretch gap-4">
            <CategoryBreakdown snapshot={snapshot} />
            <LowStock products={MOCK_PRODUCTS} />
          </div>
        </>
      )}
    </div>
  );
}
