import type { ReactNode } from "react";
import { SidebarNav } from "@/components/shared/sidebar-nav";

import { mockCurrentUser } from "@/lib/mock-current-user";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r border-border bg-card p-4">
        <SidebarNav role={mockCurrentUser.role} />
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
