import type { ReactNode } from "react";

import type { StatDelta } from "@/lib/mock-dashboard";
import { cn } from "@/lib/utils";

export function StatCard({
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
