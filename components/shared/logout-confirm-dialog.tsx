"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]" showCloseButton={false}>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex size-[46px] items-center justify-center rounded-[11px] bg-destructive-subtle">
            <LogOut className="size-[22px] text-destructive" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="font-display text-lg font-semibold text-primary">
              Log out?
            </h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              You&apos;ll need to sign in again to continue.
            </p>
          </div>

          <div className="flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Log out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
