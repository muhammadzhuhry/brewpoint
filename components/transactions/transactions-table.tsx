"use client";

import { ChevronLeft, ChevronRight, Receipt } from "lucide-react";

import type { Transaction } from "@/lib/types";
import { formatUSD } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

export function TransactionsTable({
  pageItems,
  cashierNameById,
  isEmpty,
  currentPage,
  totalPages,
  startIndex,
  pageSize,
  filteredCount,
  onPageChange,
  onRowClick,
}: {
  pageItems: Transaction[];
  cashierNameById: Record<string, string>;
  isEmpty: boolean;
  currentPage: number;
  totalPages: number;
  startIndex: number;
  pageSize: number;
  filteredCount: number;
  onPageChange: (page: number) => void;
  onRowClick: (id: string) => void;
}) {
  return (
    <div className="flex-1 overflow-auto rounded-xl border border-border bg-card">
      {isEmpty ? (
        <div className="flex min-h-[420px] items-center justify-center p-10">
          <EmptyState
            icon={<Receipt className="size-7" />}
            title="No transactions found"
            description="Try a different date range, cashier, or status filter."
          />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Date &amp; time</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((t) => {
                const isVoided = t.status === "voided";
                return (
                  <TableRow
                    key={t.id}
                    onClick={() => onRowClick(t.id)}
                    className="h-15 cursor-pointer hover:bg-[#FAFAF8]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex size-[34px] shrink-0 items-center justify-center rounded-[9px]",
                            isVoided
                              ? "bg-destructive-subtle text-destructive"
                              : "bg-icon-chip-background text-primary",
                          )}
                        >
                          <Receipt className="size-4" />
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-primary">
                          {t.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      ·{" "}
                      {new Date(t.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      {cashierNameById[t.cashierId] ?? "—"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold tabular-nums",
                        isVoided
                          ? "text-muted-foreground line-through"
                          : "text-foreground",
                      )}
                    >
                      {formatUSD(Number(t.totalAmount))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} />
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-[#C7CCD1]" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-[13px] tabular-nums text-muted-foreground">
              Showing {startIndex + 1}–
              {Math.min(startIndex + pageSize, filteredCount)} of{" "}
              {filteredCount} transactions
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="flex h-[34px] min-w-[34px] items-center justify-center rounded-md border border-border bg-card px-1.5 text-[13px] font-medium text-foreground disabled:cursor-not-allowed disabled:text-[#C7CCD1]"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={cn(
                    "flex h-[34px] min-w-[34px] items-center justify-center rounded-md px-1.5 text-[13px]",
                    p === currentPage
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "border border-border bg-card font-medium text-foreground",
                  )}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="flex h-[34px] min-w-[34px] items-center justify-center rounded-md border border-border bg-card px-1.5 text-[13px] font-medium text-foreground disabled:cursor-not-allowed disabled:text-[#C7CCD1]"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
