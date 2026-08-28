import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import type { BestSeller, DashboardSummary } from "@/lib/types";

export function useDashboardSummary(params: { from?: string; to?: string }) {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);

  return useQuery({
    queryKey: ["dashboard", "summary", params],
    queryFn: () =>
      apiGet<DashboardSummary>(`/dashboard/summary?${searchParams.toString()}`),
  });
}

export function useBestSellers(params: {
  from?: string;
  to?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.limit) searchParams.set("limit", String(params.limit));

  return useQuery({
    queryKey: ["dashboard", "best-sellers", params],
    queryFn: () =>
      apiGet<BestSeller[]>(
        `/dashboard/best-sellers?${searchParams.toString()}`,
      ),
  });
}
