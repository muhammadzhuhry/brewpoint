"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, KeyRound } from "lucide-react";
import { toast } from "sonner";

import type { User } from "@/lib/types";
import { apiPost } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function generatePassword() {
  const words = ["brew", "bean", "roast", "crema", "latte", "mocha"];
  const word = words[Math.floor(Math.random() * words.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${word}-${number}`;
}

function ResetPasswordContent({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [tempPassword, setTempPassword] = useState("");

  const resetMutation = useMutation({
    mutationFn: (password: string) =>
      apiPost<User>(`/users/${user.id}/reset-password`, { password }),
    onSuccess: () => {
      navigator.clipboard.writeText(tempPassword).catch(() => {});
      toast.success("Password reset");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to reset password",
      );
    },
  });

  const handleGenerate = () => {
    const pw = generatePassword();
    setTempPassword(pw);
    resetMutation.mutate(pw);
  };

  const done = resetMutation.isSuccess;

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex size-[46px] items-center justify-center rounded-[11px] bg-[#E7EFF7]">
        <KeyRound className="size-[22px] text-[#3A6BA8]" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-lg font-semibold text-primary">
          {done
            ? `Password reset for ${user.name}`
            : `Reset ${user.name}'s password?`}
        </h3>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          {done
            ? "A temporary password has been generated. Their old password no longer works."
            : "This generates a new temporary password and invalidates the current one. The staff member will need the new password to log in."}
        </p>
      </div>

      {done && (
        <div className="flex flex-col gap-2">
          <span className="text-[11.5px] font-semibold tracking-wide text-muted-foreground">
            TEMPORARY PASSWORD
          </span>
          <div className="flex items-center justify-between rounded-[10px] border border-border bg-[#F7F7F5] px-3.5 py-3">
            <span className="font-mono text-base font-semibold tracking-wide text-primary">
              {tempPassword}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
              <Check className="size-3.5" />
              Copied
            </span>
          </div>
          <span className="text-xs leading-relaxed text-muted-foreground">
            Share this with the staff member. They&apos;ll be asked to set a new
            password on next login.
          </span>
        </div>
      )}

      <div className="flex justify-end gap-2.5">
        {done ? (
          <Button onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleGenerate}>Generate password</Button>
          </>
        )}
      </div>
    </div>
  );
}

export function ResetPasswordDialog({
  user,
  onOpenChange,
}: {
  user: User | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[430px]" showCloseButton={false}>
        {user && (
          <ResetPasswordContent
            key={user.id}
            user={user}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
