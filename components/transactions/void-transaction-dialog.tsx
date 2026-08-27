"use client";

import { useState } from "react";
import { Ban } from "lucide-react";

import type { TransactionDetail } from "@/lib/types";
import { formatUSD } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const VOID_REASONS = [
  "Wrong item rung up",
  "Customer changed mind",
  "Duplicate charge",
  "Cashier error",
  "Refund issued",
];

export function VoidTransactionDialog({
  transaction,
  onOpenChange,
  onConfirm,
}: {
  transaction: TransactionDetail | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}) {
  return (
    <Dialog open={transaction !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px]" showCloseButton={false}>
        {transaction && (
          <VoidTransactionForm
            key={transaction.id}
            transaction={transaction}
            onCancel={() => onOpenChange(false)}
            onConfirm={onConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function VoidTransactionForm({
  transaction,
  onCancel,
  onConfirm,
}: {
  transaction: TransactionDetail;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("A reason is required to void a transaction.");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex size-[46px] items-center justify-center rounded-[11px] bg-destructive-subtle">
        <Ban className="size-[22px] text-destructive" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-lg font-semibold text-primary">
          Void {transaction.id.slice(0, 8).toUpperCase()}?
        </h3>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          This reverses the sale of{" "}
          <strong className="text-foreground">
            {formatUSD(Number(transaction.totalAmount))}
          </strong>{" "}
          and returns its items to stock. Voided transactions stay in history
          for reporting. This can&apos;t be undone.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          Reason for voiding <span className="text-destructive">· required</span>
        </label>
        <div className="flex flex-wrap gap-[7px]">
          {VOID_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setReason(r);
                setError("");
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12.5px] font-medium",
                reason === r
                  ? "border-destructive bg-destructive text-destructive-foreground"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <Textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          placeholder="Explain why this sale is being voided…"
          className={cn("h-16 resize-none", error && "border-destructive")}
        />
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>

      <div className="flex justify-end gap-2.5">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleConfirm}>
          Void transaction
        </Button>
      </div>
    </div>
  );
}
