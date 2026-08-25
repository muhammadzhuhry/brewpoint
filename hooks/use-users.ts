import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import type { User } from "@/lib/types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiGet<User[]>("/users"),
  });
}
