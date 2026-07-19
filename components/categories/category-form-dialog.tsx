"use client";

import { useState } from "react";

import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function CategoryForm({
  mode,
  category,
  existingNames,
  onSubmit,
  onCancel,
}: {
  mode: "add" | "edit";
  category: Category | null;
  existingNames: string[];
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [error, setError] = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return;
    }
    const isDuplicate = existingNames.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase(),
    );
    if (isDuplicate) {
      setError("A category with this name already exists.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? "Rename category" : "New category"}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-1.5 px-6 py-6">
        <Label htmlFor="category-name">
          Category name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="category-name"
          placeholder="e.g. Seasonal Drinks"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
        />
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {mode === "edit" ? "Save changes" : "Create category"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  mode,
  category,
  existingNames,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  category: Category | null;
  existingNames: string[];
  onSubmit: (name: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <CategoryForm
            key={category?.id ?? "add"}
            mode={mode}
            category={category}
            existingNames={existingNames}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
