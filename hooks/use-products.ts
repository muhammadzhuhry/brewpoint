import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import type { ProductSearchResult } from "@/lib/types";

export function useProducts(params: {
  search?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));

  return useQuery({
    queryKey: ["products", params],
    queryFn: () =>
      apiGet<ProductSearchResult>(`/products?${searchParams.toString()}`),
  });
}
