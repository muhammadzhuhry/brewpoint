"use client";

import { useState } from "react";

import { MOCK_TRANSACTIONS } from "@/lib/mock-transactions";
import { getTransactionTotal } from "@/lib/transaction-utils";
import { mockCurrentUser } from "@/lib/mock-current-user";

import { PageHeader } from "@/components/shared/page-header";
import { TransactionStats } from "@/components/transactions/transaction-stats";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { TransactionDetailSheet } from "@/components/transactions/transaction-detail-sheet";
import { VoidTransactionDialog } from "@/components/transactions/void-transaction-dialog";

const PAGE_SIZE = 8;

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

      <TransactionStats
        gross={gross}
        completedCount={completed.length}
        avgTicket={avgTicket}
        voidedCount={voided.length}
      />

      <TransactionFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        cashierFilter={cashierFilter}
        onCashierFilterChange={(value) => {
          setCashierFilter(value);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(filter) => {
          setStatusFilter(filter);
          setPage(1);
        }}
        isAdmin={isAdmin}
      />

      <TransactionsTable
        pageItems={pageItems}
        isEmpty={filtered.length === 0}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        pageSize={PAGE_SIZE}
        filteredCount={filtered.length}
        onPageChange={setPage}
        onRowClick={setDetailId}
      />

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
