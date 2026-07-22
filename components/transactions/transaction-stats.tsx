import type { ReactNode } from "react";
import { Ban, DollarSign, Receipt, Tag } from "lucide-react";

import { formatUSD } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon,
  iconDanger,
  valueDanger,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  iconDanger?: boolean;
  valueDanger?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted-foreground">
          {label}
        </span>
        <div
          className={cn(
            "flex size-[30px] items-center justify-center rounded-lg",
            iconDanger
              ? "bg-destructive-subtle text-destructive"
              : "bg-icon-chip-background text-primary",
          )}
        >
          {icon}
        </div>
      </div>
      <span
        className={cn(
          "font-display text-2xl font-semibold tracking-tight tabular-nums",
          valueDanger ? "text-destructive-subtle-foreground" : "text-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function TransactionStats({
  gross,
  completedCount,
  avgTicket,
  voidedCount,
}: {
  gross: number;
  completedCount: number;
  avgTicket: number;
  voidedCount: number;
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        label="Gross sales"
        value={formatUSD(gross)}
        icon={<DollarSign className="size-4" />}
      />
      <StatCard
        label="Transactions"
        value={String(completedCount)}
        icon={<Receipt className="size-4" />}
      />
      <StatCard
        label="Avg. ticket"
        value={formatUSD(avgTicket)}
        icon={<Tag className="size-4" />}
      />
      <StatCard
        label="Voided"
        value={String(voidedCount)}
        icon={<Ban className="size-4" />}
        iconDanger
        valueDanger={voidedCount > 0}
      />
    </div>
  );
}
