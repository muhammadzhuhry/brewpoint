import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import type { StockAdjustment } from "@/lib/types";

export function useStockAdjustments(productId: string | null) {
  return useQuery({
    queryKey: ["stock-adjustments", productId],
    queryFn: () =>
      apiGet<StockAdjustment[]>(`/products/${productId}/stock-adjustments`),
    enabled: productId !== null,
  });
}
