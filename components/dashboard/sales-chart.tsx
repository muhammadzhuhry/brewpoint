"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from "recharts";

import type { DashboardSnapshot } from "@/lib/mock-dashboard";

export function SalesChart({ snapshot }: { snapshot: DashboardSnapshot }) {
  const maxBarValue = Math.max(...snapshot.bars.map((b) => b.value));

  return (
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
                  fill={bar.value >= maxBarValue * 0.82 ? "#2B3A4A" : "#9DB4CE"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
