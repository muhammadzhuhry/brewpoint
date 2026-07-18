import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required."),
  category: z.string().min(1, "Choose a category."),
  price: z
    .string()
    .min(1, "Price is required.")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0,
      "Enter a valid price (0 or more).",
    ),
  stock: z
    .string()
    .min(1, "Stock quantity is required.")
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) >= 0,
      "Enter a whole number (0 or more).",
    ),
  barcode: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
