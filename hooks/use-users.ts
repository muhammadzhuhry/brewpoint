import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import type { User } from "@/lib/types";

export function useUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiGet<User[]>("/users"),
    enabled: options?.enabled,
  });
}
