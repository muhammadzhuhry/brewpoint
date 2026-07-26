import { useQuery } from "@tanstack/react-query";

import { MOCK_PRODUCTS } from "@/lib/mock-products";

function fetchProducts() {
  return new Promise<typeof MOCK_PRODUCTS>((resolve) => {
    setTimeout(() => resolve(MOCK_PRODUCTS), 500);
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}
