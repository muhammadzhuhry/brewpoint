import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import type { CategoryWithProductCount } from "@/lib/types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<CategoryWithProductCount[]>("/categories"),
  });
}
