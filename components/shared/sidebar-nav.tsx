"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  Package,
  Tag,
  Receipt,
  LayoutDashboard,
  Users,
  Boxes,
  Coffee,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    href: "/pos",
    label: "POS",
    icon: ShoppingCart,
    roles: ["admin", "cashier"],
  },
  {
    href: "/products",
    label: "Products",
    icon: Coffee,
    roles: ["admin", "cashier"],
  },
  {
    href: "/categories",
    label: "Categories",
    icon: Tag,
    roles: ["admin", "cashier"],
  },
  { href: "/users", label: "Users", icon: Users, roles: ["admin"] },
  {
    href: "/stock",
    label: "Stock",
    icon: Package,
    roles: ["admin"],
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: Receipt,
    roles: ["admin", "cashier"],
  },
];

export function SidebarNav({ role }: { role: "admin" | "cashier" }) {
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const pathname = usePathname();

  return (
    <>
      <div className="px-3 pt-1 pb-1.5">
        <span className="pl-3 text-[10.5px] font-semibold tracking-[.09em] text-[#9AA1AB]">
          MENU
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-auto px-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-[11px] rounded-md px-3 py-[9px] text-sm",
                pathname === item.href
                  ? "bg-icon-chip-background font-semibold text-primary"
                  : "font-medium text-muted-foreground",
              )}
            >
              <Icon className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
