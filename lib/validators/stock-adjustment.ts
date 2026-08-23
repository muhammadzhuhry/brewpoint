import { z } from "zod";

export const createAdjustmentBodySchema = z.object({
  adjustmentType: z.enum(["increase", "decrease"]),
  quantity: z.number().int().positive(),
  reason: z
    .string()
    .trim()
    .min(1, "A reason is required to record a stock adjustment."),
});
