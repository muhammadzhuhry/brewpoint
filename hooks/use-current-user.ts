import { useQuery } from "@tanstack/react-query";

import type { SessionClaims } from "@/lib/auth/jwt";
import { apiGet } from "@/lib/api-client";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => apiGet<SessionClaims>("/auth/me"),
    retry: false,
  });
}
