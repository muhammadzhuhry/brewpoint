"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";

import type { Product } from "@/lib/types";
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validators/product";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  category: "",
  price: "",
  stock: "",
  barcode: "",
};

export function ProductFormDialog({
  open,
  onOpenChange,
  mode,
  product,
  categories,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  product: Product | null;
  categories: string[];
  onSubmit: (values: ProductFormValues, imageUrl?: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    if (product) {
      form.reset({
        name: product.name,
        category: product.category,
        price: String(product.price),
        stock: String(product.stock),
        barcode: product.barcode,
      });
      setImagePreview(product.imageUrl ?? null);
    } else {
      form.reset(EMPTY_VALUES);
      setImagePreview(null);
    }
  }, [open, product, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (values: ProductFormValues) => {
    onSubmit(values, imagePreview ?? undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit product" : "Add product"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4.5 px-6 py-6"
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="product-name">
                  Product name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="product-name"
                  placeholder="e.g. Iced Caramel Macchiato"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="category"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-category">
                    Category <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="product-category"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select a category…" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="barcode"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="product-barcode">
                    Barcode{" "}
                    <span className="font-normal text-muted-foreground">
                      · optional
                    </span>
                  </FieldLabel>
                  <Input
                    id="product-barcode"
                    placeholder="e.g. 785002147"
                    className="tabular-nums"
                    {...field}
                  />
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-price">
                    Price (USD) <span className="text-destructive">*</span>
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="product-price"
                      placeholder="0.00"
                      className="pl-6 tabular-nums"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="stock"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-stock">
                    Stock quantity <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="product-stock"
                    placeholder="0"
                    className="tabular-nums"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <Field>
            <FieldLabel>
              Product image{" "}
              <span className="font-normal text-muted-foreground">
                · optional
              </span>
            </FieldLabel>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="size-14 rounded-lg object-cover"
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-left text-sm font-medium text-accent"
                  >
                    Change image
                  </button>
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="text-left text-xs text-muted-foreground"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#C7CCD1] bg-[repeating-linear-gradient(45deg,#F7F5F1,#F7F5F1_10px,#F1EEE8_10px,#F1EEE8_20px)] p-5"
              >
                <Upload className="size-[22px] text-muted-foreground" />
                <span className="text-[13px] font-medium text-muted-foreground">
                  Drop an image or <span className="text-accent">browse</span>
                </span>
                <span className="font-mono text-[11px] text-muted-foreground/70">
                  PNG / JPG · up to 2MB
                </span>
              </div>
            )}
          </Field>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)}>
            {mode === "edit" ? "Save changes" : "Add product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
