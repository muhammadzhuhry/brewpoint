"use client";

import { Ban } from "lucide-react";

import type { Transaction } from "@/lib/types";
import { getTransactionTotal } from "@/lib/transaction-utils";
import { formatUSD } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/status-badge";

export function TransactionDetailSheet({
  transaction,
  onOpenChange,
  canVoid,
  onVoid,
}: {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
  canVoid: boolean;
  onVoid: (transaction: Transaction) => void;
}) {
  return (
    <Sheet open={transaction !== null} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Transaction detail</SheetTitle>
        </SheetHeader>

        {transaction && (
          <div className="flex flex-1 flex-col gap-5 overflow-auto px-6 py-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-display text-xl font-semibold tabular-nums text-primary">
                  {transaction.id}
                </span>
                <span className="text-[13px] tabular-nums text-muted-foreground">
                  {transaction.time}
                </span>
              </div>
              <StatusBadge status={transaction.status} />
            </div>

            {transaction.status === "voided" && (
              <div className="flex flex-col gap-1 rounded-[10px] border border-[#EBC6C1] bg-destructive-subtle p-3.5">
                <span className="text-xs font-semibold text-destructive-subtle-foreground">
                  Voided by {transaction.voidBy ?? "Admin"}
                </span>
                <span className="text-[12.5px] text-destructive-subtle-foreground">
                  Reason: {transaction.voidReason ?? "—"}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-[11.5px] font-semibold tracking-wide text-muted-foreground">
                ITEMS
              </span>
              <div className="flex flex-col">
                {transaction.items.map((item, i) => (
                  <div
                    key={item.name}
                    className={cn(
                      "flex items-center gap-3 py-2.5",
                      i < transaction.items.length - 1 &&
                        "border-b border-[#F1F0EC]",
                    )}
                  >
                    <span className="flex h-[26px] w-[30px] shrink-0 items-center justify-center rounded-[7px] bg-icon-chip-background text-[12.5px] font-semibold tabular-nums text-primary">
                      ×{item.qty}
                    </span>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {formatUSD(item.price)} each
                      </span>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-foreground">
                      {formatUSD(item.qty * item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 rounded-xl bg-table-header-background p-4">
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-sm tabular-nums text-foreground">
                  {formatUSD(getTransactionTotal(transaction))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] text-muted-foreground">
                  Payment · {transaction.method}
                </span>
                <span className="text-sm tabular-nums text-foreground">
                  {formatUSD(transaction.received)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] text-muted-foreground">
                  Change
                </span>
                <span className="text-sm tabular-nums text-foreground">
                  {formatUSD(
                    transaction.received - getTransactionTotal(transaction),
                  )}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] font-semibold text-foreground">
                  Total
                </span>
                <span className="text-xl font-semibold tabular-nums text-primary">
                  {formatUSD(getTransactionTotal(transaction))}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[12.5px] text-muted-foreground">
                Cashier
              </span>
              <span className="text-sm font-medium text-foreground">
                {transaction.cashier}
              </span>
            </div>
          </div>
        )}

        {canVoid && transaction && (
          <SheetFooter>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => onVoid(transaction)}
            >
              <Ban className="size-4" />
              Void this transaction
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
