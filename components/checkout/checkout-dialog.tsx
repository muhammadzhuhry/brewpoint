"use client";

import { CreditCard } from "lucide-react";

import { formatUSD } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

export function CheckoutDialog({
  open,
  onOpenChange,
  subtotal,
  received,
  onReceivedChange,
  quickCashValues,
  isValidReceived,
  change,
  onCompleteSale,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtotal: number;
  received: string;
  onReceivedChange: (value: string) => void;
  quickCashValues: number[];
  isValidReceived: boolean;
  change: number;
  onCompleteSale: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Take payment</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between rounded-xl bg-icon-chip-background px-[18px] py-4">
            <span className="text-sm font-medium text-icon-chip-foreground">
              Total due
            </span>
            <span className="font-display text-[28px] font-semibold tracking-tight text-primary">
              {formatUSD(subtotal)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <CreditCard className="size-[15px] text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">
                Cash received
              </span>
            </div>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-xl font-semibold text-primary">
                $
              </span>
              <input
                value={received}
                onChange={(e) =>
                  onReceivedChange(e.target.value.replace(/[^0-9.]/g, ""))
                }
                placeholder="0.00"
                className="h-[60px] w-full rounded-xl border border-border bg-card pr-4 pl-9 text-2xl font-semibold text-primary outline-none"
              />
            </div>
            <div className="mt-0.5 flex gap-2">
              {quickCashValues.map((value, i) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onReceivedChange(value.toFixed(2))}
                  className="flex h-10 flex-1 items-center justify-center rounded-[10px] border border-border bg-card text-[13.5px] font-semibold text-primary"
                >
                  {i === 0 ? "Exact" : formatUSD(value)}
                </button>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "flex items-center justify-between rounded-xl border border-dashed px-[18px] py-3.5",
              isValidReceived
                ? "border-[#BCDCC4] bg-[#F1F8F2]"
                : "border-border bg-[#FAFAF8]",
            )}
          >
            <span className="text-sm font-medium text-muted-foreground">
              Change due
            </span>
            <span
              className={cn(
                "text-xl font-semibold tabular-nums",
                isValidReceived ? "text-success" : "text-muted-foreground",
              )}
            >
              {isValidReceived ? formatUSD(change) : "—"}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back
          </Button>
          <Button disabled={!isValidReceived} onClick={onCompleteSale}>
            Complete sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
