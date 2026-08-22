import { z } from "zod";

export const createCategoryBodySchema = z.object({
  name: z.string().trim().min(1, "Category name is required."),
});

export const updateCategoryBodySchema = z.object({
  name: z.string().trim().min(1, "Category name is required."),
});
