import type { DashboardSnapshot } from "@/lib/mock-dashboard";
import { cn } from "@/lib/utils";

export function BestSellers({ snapshot }: { snapshot: DashboardSnapshot }) {
  const maxBestSellerQty = snapshot.bestSellers[0]?.qty ?? 1;

  return (
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
  );
}
