import { useQuery } from "@tanstack/react-query";

import { MOCK_TRANSACTIONS } from "@/lib/mock-transactions";

function fetchTransactions() {
  return new Promise<typeof MOCK_TRANSACTIONS>((resolve) => {
    setTimeout(() => resolve(MOCK_TRANSACTIONS), 500);
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });
}
