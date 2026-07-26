import { Coffee, DollarSign, Receipt, Tag } from "lucide-react";

import type { DashboardSnapshot } from "@/lib/mock-dashboard";
import { StatCard } from "@/components/dashboard/stat-card";

export function StatsGrid({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
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
  );
}
