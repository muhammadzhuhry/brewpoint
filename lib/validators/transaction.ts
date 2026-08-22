import { z } from "zod";

export const checkoutBodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Cart must contain at least one item."),
  amountReceived: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (e.g. 20.00)."),
});

export const voidBodySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "A reason is required to void a transaction."),
});
