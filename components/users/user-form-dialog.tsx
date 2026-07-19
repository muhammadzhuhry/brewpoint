"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";

import type { User } from "@/lib/types";
import { getUserFormSchema, type UserFormValues } from "@/lib/validators/user";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function generatePassword() {
  const words = ["brew", "bean", "roast", "crema", "latte", "mocha"];
  const word = words[Math.floor(Math.random() * words.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${word}-${number}`;
}

function UserForm({
  mode,
  user,
  existingUsernames,
  onSubmit,
  onCancel,
}: {
  mode: "add" | "edit";
  user: User | null;
  existingUsernames: string[];
  onSubmit: (values: UserFormValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(getUserFormSchema(mode, existingUsernames)),
    defaultValues: {
      name: user?.name ?? "",
      username: user?.username ?? "",
      password: "",
      role: user?.role ?? "Cashier",
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? "Edit staff member" : "Add staff member"}
        </DialogTitle>
      </DialogHeader>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4.5 px-6 py-6"
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="user-name">
                Full name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="user-name"
                placeholder="e.g. Alex Moreno"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="user-username">
                Username <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="user-username"
                placeholder="e.g. alex"
                {...field}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        {mode === "add" && (
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-password">
                  Temporary password <span className="text-destructive">*</span>
                </FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="user-password"
                    placeholder="Set or generate"
                    className="flex-1 tabular-nums"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => field.onChange(generatePassword())}
                  >
                    <RefreshCw className="size-4" />
                    Generate
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                  Staff will be prompted to change this on first login.
                </span>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        )}

        <Controller
          name="role"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Role</FieldLabel>
              <div className="flex gap-0.5 rounded-[10px] border border-border bg-background p-[3px]">
                {(["Admin", "Cashier"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => field.onChange(r)}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-sm",
                      field.value === r
                        ? "bg-card font-semibold text-primary shadow-sm"
                        : "font-medium text-muted-foreground",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {field.value === "Admin"
                  ? "Full access — manage products, staff, and reports."
                  : "Can ring up sales and view products; no admin management."}
              </span>
            </Field>
          )}
        />
      </form>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)}>
          {mode === "edit" ? "Save changes" : "Create account"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  existingUsernames,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  user: User | null;
  existingUsernames: string[];
  onSubmit: (values: UserFormValues) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <UserForm
            key={user?.id ?? "add"}
            mode={mode}
            user={user}
            existingUsernames={existingUsernames}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
