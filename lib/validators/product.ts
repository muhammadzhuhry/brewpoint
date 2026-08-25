import { z } from "zod";

// productSchema = frontend form validation schema;
export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required."),
  categoryId: z.string().min(1, "Choose a category."),
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

// createProductBodySchema & updateProductBodySchema = backend request-body validation schema
export const createProductBodySchema = z.object({
  name: z.string().trim().min(1, "Product name is required."),
  categoryId: z.uuid("Invalid category id."),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price (e.g. 4.25)."),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative."),
  barcode: z.string().trim().min(1).optional(),
  imageUrl: z.string().url().optional(),
});

export const updateProductBodySchema = createProductBodySchema;
