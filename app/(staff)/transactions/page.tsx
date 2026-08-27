"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Transaction, TransactionDetail } from "@/lib/types";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUsers } from "@/hooks/use-users";
import { useTransactions, useTransactionDetail } from "@/hooks/use-transactions";
import { apiPost } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";

import { PageHeader } from "@/components/shared/page-header";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { TransactionDetailSheet } from "@/components/transactions/transaction-detail-sheet";
import { VoidTransactionDialog } from "@/components/transactions/void-transaction-dialog";

const PAGE_SIZE = 8;

function getDateRangeBounds(range: "today" | "7days" | "30days") {
  const to = new Date();
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  if (range === "7days") from.setDate(from.getDate() - 6);
  if (range === "30days") from.setDate(from.getDate() - 29);
  return { from: from.toISOString(), to: to.toISOString() };
}

export default function TransactionsPage() {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const { data: usersData } = useUsers({ enabled: isAdmin });
  const cashiers = usersData ?? [];
  const cashierNameById: Record<string, string> = {
    ...(currentUser ? { [currentUser.userId]: currentUser.name } : {}),
    ...Object.fromEntries(cashiers.map((u) => [u.id, u.name])),
  };

  const [dateRange, setDateRange] = useState<"today" | "7days" | "30days">(
    "today",
  );
  const [cashierFilter, setCashierFilter] = useState("All cashiers");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "voided"
  >("all");
  const [page, setPage] = useState(1);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [voidTarget, setVoidTarget] = useState<TransactionDetail | null>(null);

  const { from, to } = getDateRangeBounds(dateRange);
  const { data } = useTransactions({
    cashierId:
      isAdmin && cashierFilter !== "All cashiers" ? cashierFilter : undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    from,
    to,
    page,
    pageSize: PAGE_SIZE,
  });

  const transactions = data?.items ?? [];
  const totalCount = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = data?.page ?? page;
  const startIndex = data ? (data.page - 1) * data.pageSize : 0;

  const { data: detailTransaction } = useTransactionDetail(detailId);

  const canVoid = isAdmin && detailTransaction?.status !== "voided";

  const voidMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiPost<Transaction>(`/transactions/${id}/void`, { reason }),
    onSuccess: () => {
      setVoidTarget(null);
      setDetailId(null);
      toast.success("Transaction voided");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to void transaction",
      );
    },
  });

  const handleVoidConfirm = (reason: string) => {
    if (!voidTarget) return;
    voidMutation.mutate({ id: voidTarget.id, reason });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transactions"
        count={`${totalCount} transactions`}
      />

      <TransactionFilters
        dateRange={dateRange}
        onDateRangeChange={(value) => {
          setDateRange(value);
          setPage(1);
        }}
        cashierFilter={cashierFilter}
        onCashierFilterChange={(value) => {
          setCashierFilter(value);
          setPage(1);
        }}
        cashiers={cashiers}
        statusFilter={statusFilter}
        onStatusFilterChange={(filter) => {
          setStatusFilter(filter);
          setPage(1);
        }}
        isAdmin={isAdmin}
      />

      <TransactionsTable
        pageItems={transactions}
        cashierNameById={cashierNameById}
        isEmpty={transactions.length === 0}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        pageSize={PAGE_SIZE}
        filteredCount={totalCount}
        onPageChange={setPage}
        onRowClick={setDetailId}
      />

      <TransactionDetailSheet
        transaction={detailTransaction ?? null}
        cashierNameById={cashierNameById}
        onOpenChange={(open) => !open && setDetailId(null)}
        canVoid={canVoid}
        onVoid={(t) => setVoidTarget(t)}
      />

      <VoidTransactionDialog
        transaction={voidTarget}
        onOpenChange={(open) => !open && setVoidTarget(null)}
        onConfirm={handleVoidConfirm}
      />
    </div>
  );
}
