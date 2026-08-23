import type { ReactNode } from "react";
import { Coffee } from "lucide-react";
import { StaffUserPanel } from "@/components/shared/staff-user-panel";

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

        <StaffUserPanel />
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
