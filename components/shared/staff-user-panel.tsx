"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { useCurrentUser } from "@/hooks/use-current-user";
import { apiPost } from "@/lib/api-client";
import { getInitials } from "@/lib/avatar-color";
import { SidebarNav } from "@/components/shared/sidebar-nav";

export function StaffUserPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (isError) {
      router.push("/login");
    }
  }, [isError, router]);

  if (isLoading || !user) {
    return null;
  }

  async function handleLogout() {
    await apiPost("/auth/logout");
    queryClient.removeQueries({ queryKey: ["current-user"] });
    router.push("/login");
  }

  return (
    <>
      <SidebarNav role={user.role} />

      <div className="flex items-center gap-2.5 border-t border-border p-3">
        <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-secondary font-display text-[13px] font-semibold text-secondary-foreground">
          {getInitials(user.name)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-semibold text-foreground">
            {user.name}
          </span>
          <span className="text-[11px] text-muted-foreground capitalize">
            {user.role}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground"
        >
          <LogOut className="size-[17px]" />
        </button>
      </div>
    </>
  );
}
