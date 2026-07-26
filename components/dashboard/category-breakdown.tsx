import type { DashboardSnapshot } from "@/lib/mock-dashboard";

export function CategoryBreakdown({
  snapshot,
}: {
  snapshot: DashboardSnapshot;
}) {
  return (
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
  );
}
