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

export function AdjustmentHistory({
  entries,
  adminNameById,
}: {
  entries: StockAdjustment[];
  adminNameById: Record<string, string>;
}) {
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
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const isIncrease = entry.adjustmentType === "increase";
              return (
                <TableRow key={entry.id} className="h-[52px]">
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
                      {entry.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-[13.5px] text-foreground">
                    {entry.reason}
                  </TableCell>
                  <TableCell className="text-[13.5px] text-muted-foreground">
                    {adminNameById[entry.adminId] ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-[13px] tabular-nums text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    ·{" "}
                    {new Date(entry.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
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
