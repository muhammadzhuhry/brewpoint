"use client";

import { Check, Power } from "lucide-react";

import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function DeactivateUserDialog({
  user,
  onOpenChange,
  onConfirm,
}: {
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const reactivating = user ? !user.active : false;

  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]" showCloseButton={false}>
        <div className="flex flex-col gap-4 p-6">
          <div
            className={cn(
              "flex size-[46px] items-center justify-center rounded-[11px]",
              reactivating ? "bg-success-subtle" : "bg-destructive-subtle",
            )}
          >
            {reactivating ? (
              <Check className="size-[22px] text-success" />
            ) : (
              <Power className="size-[22px] text-destructive" />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="font-display text-lg font-semibold text-primary">
              {reactivating
                ? `Reactivate ${user?.name}?`
                : `Deactivate ${user?.name}?`}
            </h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              {reactivating
                ? "They'll be able to log in again with their existing credentials."
                : "They'll lose login access immediately. Their past transactions stay intact and linked to their name for reporting. You can reactivate them anytime."}
            </p>
          </div>

          <div className="flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant={reactivating ? "default" : "destructive"}
              className={
                reactivating
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : undefined
              }
              onClick={onConfirm}
            >
              {reactivating ? "Reactivate" : "Deactivate"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
