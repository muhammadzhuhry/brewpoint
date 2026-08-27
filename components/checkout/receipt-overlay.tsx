"use client";

import { Check, Printer } from "lucide-react";

import type { Receipt } from "@/lib/types";
import { formatUSD } from "@/lib/format-currency";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";

export function ReceiptOverlay({
  receipt,
  onNewSale,
}: {
  receipt: Receipt | null;
  onNewSale: () => void;
}) {
  const { data: currentUser } = useCurrentUser();

  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/55">
      <div className="flex max-h-210 w-100 flex-col overflow-auto rounded-2xl bg-card shadow-[0_20px_60px_rgba(15,20,24,0.32)]">
        <div className="flex flex-col items-center gap-3.5 border-b border-dashed border-border px-7 pt-7 pb-5 text-center">
          <div className="flex size-15 items-center justify-center rounded-full bg-success-subtle">
            <Check className="size-7.5 text-success" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display text-xl font-semibold text-primary">
              Payment complete
            </span>
            <span className="text-[13px] tabular-nums text-muted-foreground">
              {receipt.ref} · {receipt.time}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-7 py-5.5">
          <span className="text-[11.5px] font-semibold tracking-wide text-muted-foreground">
            MAPLE &amp; VINE COFFEE · {currentUser?.name.toUpperCase() ?? ""}
          </span>

          <div className="flex flex-col gap-2">
            {receipt.lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-6.5 text-[13px] tabular-nums text-muted-foreground">
                  {line.qty}×
                </span>
                <span className="flex-1 text-[13.5px] text-foreground">
                  {line.name}
                </span>
                <span className="text-[13.5px] font-medium tabular-nums text-foreground">
                  {formatUSD(line.price * line.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="h-px bg-[#F1F0EC]" />

          <div className="flex justify-between">
            <span className="text-[13.5px] text-muted-foreground">
              Subtotal
            </span>
            <span className="text-[13.5px] font-medium tabular-nums text-foreground">
              {formatUSD(receipt.subtotal)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-base font-semibold text-primary">
              Total
            </span>
            <span className="text-xl font-semibold tabular-nums text-primary">
              {formatUSD(receipt.subtotal)}
            </span>
          </div>

          <div className="mt-1 flex flex-col gap-2 rounded-xl bg-table-header-background p-3.5">
            <div className="flex justify-between">
              <span className="text-[13px] text-muted-foreground">
                Cash received
              </span>
              <span className="text-[13.5px] font-medium tabular-nums text-foreground">
                {formatUSD(receipt.paid)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-muted-foreground">Change</span>
              <span className="text-[13.5px] font-semibold tabular-nums text-success">
                {formatUSD(receipt.change)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-7 pt-4 pb-6">
          <Button variant="secondary" className="shrink-0">
            <Printer className="size-4" />
            Print
          </Button>
          <Button className="flex-1" onClick={onNewSale}>
            New sale
          </Button>
        </div>
      </div>
    </div>
  );
}
