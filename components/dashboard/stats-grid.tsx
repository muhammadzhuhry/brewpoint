import { DollarSign, Receipt, Tag } from "lucide-react";

import type { StatDelta } from "@/lib/types";
import { StatCard } from "@/components/dashboard/stat-card";

export function StatsGrid({
  totalSales,
  transactionCount,
  avgTicket,
  deltas,
  deltaNote,
}: {
  totalSales: string;
  transactionCount: number;
  avgTicket: string;
  deltas: { sales: StatDelta; txns: StatDelta; avg: StatDelta };
  deltaNote: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        label="Total sales"
        value={totalSales}
        icon={<DollarSign className="size-4" />}
        delta={deltas.sales}
        deltaNote={deltaNote}
      />
      <StatCard
        label="Transactions"
        value={String(transactionCount)}
        icon={<Receipt className="size-4" />}
        delta={deltas.txns}
        deltaNote={deltaNote}
      />
      <StatCard
        label="Avg. ticket"
        value={avgTicket}
        icon={<Tag className="size-4" />}
        delta={deltas.avg}
        deltaNote={deltaNote}
      />
    </div>
  );
}
