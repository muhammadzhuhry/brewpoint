"use client";

import { KeyRound, Pencil } from "lucide-react";

import type { User } from "@/lib/types";
import { getTileColor, getInitials } from "@/lib/avatar-color";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

export function UserDetailSheet({
  user,
  onOpenChange,
  onEdit,
  onResetPassword,
}: {
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
}) {
  const [tileBg, tileFg] = user
    ? getTileColor(user.name)
    : ["#EFEFEF", "#6B7280"];

  return (
    <Sheet open={user !== null} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Staff detail</SheetTitle>
        </SheetHeader>

        {user && (
          <div className="flex flex-1 flex-col gap-5 overflow-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <div
                className="flex size-17 shrink-0 items-center justify-center rounded-full font-display text-2xl font-semibold"
                style={{ backgroundColor: tileBg, color: tileFg }}
              >
                {getInitials(user.name)}
              </div>
              <div className="flex flex-col gap-1.75">
                <span className="font-display text-xl font-semibold text-primary">
                  {user.name}
                </span>
                <div className="flex gap-2">
                  <Badge variant={user.role === "admin" ? "secondary" : "info"}>
                    {user.role === "admin" ? "Admin" : "Cashier"}
                  </Badge>
                  <StatusBadge status={user.isActive ? "active" : "inactive"} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              {[
                ["USERNAME", `@${user.username}`],
                [
                  "ROLE",
                  user.role === "admin"
                    ? "Admin — full access"
                    : "Cashier — POS & products (read-only admin)",
                ],
                [
                  "JOINED",
                  new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 border-b border-[#F1F0EC] pb-3.5"
                >
                  <span className="text-[11.5px] font-semibold tracking-wide text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-[15px] font-medium text-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <SheetFooter>
          <Button className="flex-1" onClick={() => user && onEdit(user)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="secondary"
            onClick={() => user && onResetPassword(user)}
          >
            <KeyRound className="size-4" />
            Reset password
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
