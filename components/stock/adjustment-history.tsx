import { ArrowDown, ArrowUp } from "lucide-react";

import type { StockAdjustment } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function AdjustmentHistory({ entries }: { entries: StockAdjustment[] }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-baseline justify-between border-b border-border px-5 py-[18px]">
        <h3 className="font-display text-base font-semibold text-primary">
          Adjustment history
        </h3>
        <span className="text-[12.5px] tabular-nums text-muted-foreground">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      {entries.length === 0 ? (
        <div className="p-9 text-center text-[13px] text-muted-foreground">
          No adjustments recorded for this product yet.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Change</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Adjusted by</TableHead>
              <TableHead>When</TableHead>
              <TableHead className="text-right">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, i) => {
              const isIncrease = entry.type === "increase";
              return (
                <TableRow key={`${entry.when}-${i}`} className="h-[52px]">
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 font-semibold tabular-nums",
                        isIncrease ? "text-success" : "text-destructive",
                      )}
                    >
                      {isIncrease ? (
                        <ArrowUp className="size-3.5" />
                      ) : (
                        <ArrowDown className="size-3.5" />
                      )}
                      {isIncrease ? "+" : "−"}
                      {entry.qty}
                    </span>
                  </TableCell>
                  <TableCell className="text-[13.5px] text-foreground">
                    {entry.reason}
                  </TableCell>
                  <TableCell className="text-[13.5px] text-muted-foreground">
                    {entry.by}
                  </TableCell>
                  <TableCell className="text-[13px] tabular-nums text-muted-foreground">
                    {entry.when}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {entry.result}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
