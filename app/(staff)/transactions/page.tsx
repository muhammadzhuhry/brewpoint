"use client";

import { useState, type ReactNode } from "react";
import {
  Ban,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Receipt,
  Search,
  Tag,
} from "lucide-react";

import { MOCK_TRANSACTIONS, CASHIERS } from "@/lib/mock-transactions";
import { getTransactionTotal, getItemCount } from "@/lib/transaction-utils";
import { formatUSD } from "@/lib/format-currency";
import { mockCurrentUser } from "@/lib/mock-current-user";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TransactionDetailSheet } from "@/components/transactions/transaction-detail-sheet";
import { VoidTransactionDialog } from "@/components/transactions/void-transaction-dialog";

const PAGE_SIZE = 8;

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
              : "bg-icon-chip-background text-icon-chip-foreground",
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

export default function TransactionsPage() {
  const isAdmin = mockCurrentUser.role === "admin";

  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [cashierFilter, setCashierFilter] = useState<string | null>(
    "All cashiers",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "voided"
  >("all");
  const [page, setPage] = useState(1);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [voidId, setVoidId] = useState<string | null>(null);

  const detailTransaction = transactions.find((t) => t.id === detailId) ?? null;
  const voidTransaction = transactions.find((t) => t.id === voidId) ?? null;

  const completed = transactions.filter((t) => t.status === "completed");
  const voided = transactions.filter((t) => t.status === "voided");
  const gross = completed.reduce((sum, t) => sum + getTransactionTotal(t), 0);
  const avgTicket = completed.length ? gross / completed.length : 0;

  const filtered = transactions.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (isAdmin && cashierFilter !== "All cashiers" && t.cashier !== cashierFilter)
      return false;
    const q = search.trim().toLowerCase();
    return q === "" || t.id.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const canVoid = isAdmin && detailTransaction?.status !== "voided";

  const handleVoidConfirm = (reason: string) => {
    if (!voidTransaction) return;
    setTransactions(
      transactions.map((t) =>
        t.id === voidTransaction.id
          ? {
              ...t,
              status: "voided" as const,
              voidReason: reason,
              voidBy: mockCurrentUser.name,
            }
          : t,
      ),
    );
    setVoidId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transactions"
        count={`${transactions.length} transactions`}
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Gross sales"
          value={formatUSD(gross)}
          icon={<DollarSign className="size-4" />}
        />
        <StatCard
          label="Transactions"
          value={String(completed.length)}
          icon={<Receipt className="size-4" />}
        />
        <StatCard
          label="Avg. ticket"
          value={formatUSD(avgTicket)}
          icon={<Tag className="size-4" />}
        />
        <StatCard
          label="Voided"
          value={String(voided.length)}
          icon={<Ban className="size-4" />}
          iconDanger
          valueDanger={voided.length > 0}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-65">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search receipt no…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-border bg-card px-3.5">
          <Calendar className="size-[15px] text-muted-foreground" />
          <span className="text-[13px] font-medium text-foreground">
            Jul 7 – Jul 8, 2026
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </div>

        {isAdmin && (
          <Select
            value={cashierFilter}
            onValueChange={(value) => {
              setCashierFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CASHIERS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex-1" />

        <div className="flex gap-0.5 rounded-[9px] border border-border bg-background p-[3px]">
          {(["all", "completed", "voided"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setStatusFilter(f);
                setPage(1);
              }}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-[13px] capitalize",
                statusFilter === f
                  ? "bg-card font-semibold text-primary shadow-sm"
                  : "font-medium text-muted-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
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
                  <TableHead className="text-right">Items</TableHead>
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
                      onClick={() => setDetailId(t.id)}
                      className="h-15 cursor-pointer hover:bg-[#FAFAF8]"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "flex size-[34px] shrink-0 items-center justify-center rounded-[9px]",
                              isVoided
                                ? "bg-destructive-subtle text-destructive"
                                : "bg-icon-chip-background text-icon-chip-foreground",
                            )}
                          >
                            <Receipt className="size-4" />
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-primary">
                            {t.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {t.time}
                      </TableCell>
                      <TableCell>{t.cashier}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {getItemCount(t)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold tabular-nums",
                          isVoided
                            ? "text-muted-foreground line-through"
                            : "text-foreground",
                        )}
                      >
                        {formatUSD(getTransactionTotal(t))}
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
                {Math.min(startIndex + PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length} transactions
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="flex h-[34px] min-w-[34px] items-center justify-center rounded-md border border-border bg-card px-1.5 text-[13px] font-medium text-foreground disabled:cursor-not-allowed disabled:text-[#C7CCD1]"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={cn(
                        "flex h-[34px] min-w-[34px] items-center justify-center rounded-md px-1.5 text-[13px]",
                        p === currentPage
                          ? "bg-primary font-semibold text-primary-foreground"
                          : "border border-border bg-card font-medium text-foreground",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className="flex h-[34px] min-w-[34px] items-center justify-center rounded-md border border-border bg-card px-1.5 text-[13px] font-medium text-foreground disabled:cursor-not-allowed disabled:text-[#C7CCD1]"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <TransactionDetailSheet
        transaction={detailTransaction}
        onOpenChange={(open) => !open && setDetailId(null)}
        canVoid={canVoid}
        onVoid={(t) => setVoidId(t.id)}
      />

      <VoidTransactionDialog
        transaction={voidTransaction}
        onOpenChange={(open) => !open && setVoidId(null)}
        onConfirm={handleVoidConfirm}
      />
    </div>
  );
}
