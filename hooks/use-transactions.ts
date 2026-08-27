import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import type { TransactionDetail, TransactionSearchResult } from "@/lib/types";

export function useTransactions(params: {
  cashierId?: string;
  status?: "completed" | "voided";
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.cashierId) searchParams.set("cashierId", params.cashierId);
  if (params.status) searchParams.set("status", params.status);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));

  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () =>
      apiGet<TransactionSearchResult>(
        `/transactions?${searchParams.toString()}`,
      ),
  });
}

export function useTransactionDetail(id: string | null) {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: () => apiGet<TransactionDetail>(`/transactions/${id}`),
    enabled: id !== null,
  });
}
