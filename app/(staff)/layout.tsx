import type { ReactNode } from "react";
import { LogOut, Coffee } from "lucide-react";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { getInitials } from "@/lib/avatar-color";

import { mockCurrentUser } from "@/lib/mock-current-user";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-[11px] px-[18px] pt-5 pb-4">
          <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-primary">
            <Coffee className="size-[19px] text-secondary" strokeWidth={1.6} />
          </div>
          <div className="flex flex-col gap-px">
            <span className="font-display text-base font-semibold tracking-tight text-primary">
              BrewPoint
            </span>
            <span className="text-[11px] text-muted-foreground">
              Maple &amp; Vine Coffee
            </span>
          </div>
        </div>

        <SidebarNav role={mockCurrentUser.role} />

        <div className="flex items-center gap-2.5 border-t border-border p-3">
          <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-secondary font-display text-[13px] font-semibold text-secondary-foreground">
            {getInitials(mockCurrentUser.name)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-semibold text-foreground">
              {mockCurrentUser.name}
            </span>
            <span className="text-[11px] text-muted-foreground capitalize">
              {mockCurrentUser.role}
            </span>
          </div>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground"
          >
            <LogOut className="size-[17px]" />
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
