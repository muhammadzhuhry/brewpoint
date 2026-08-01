import { z } from "zod";

export function getUserFormSchema(
  mode: "add" | "edit",
  existingUsernames: string[],
) {
  return z.object({
    name: z.string().trim().min(1, "Full name is required."),
    username: z
      .string()
      .trim()
      .min(1, "Username is required.")
      .regex(/^[a-z0-9_.]+$/i, "Letters, numbers, dots and underscores only.")
      .refine(
        (v) =>
          !existingUsernames.some((u) => u.toLowerCase() === v.toLowerCase()),
        "This username is already taken.",
      ),
    password:
      mode === "add"
        ? z.string().trim().min(1, "Set or generate a temporary password.")
        : z.string().optional(),
    role: z.enum(["Admin", "Cashier"]),
  });
}

export type UserFormValues = z.infer<ReturnType<typeof getUserFormSchema>>;

// Backend request-body schemas — role is lowercase here to match `roleEnum`
// in lib/db/schema.ts. Username uniqueness is checked against the database
// in the service layer, not against a client-supplied list.
export const createUserBodySchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required.")
    .regex(/^[a-z0-9_.]+$/i, "Letters, numbers, dots and underscores only."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  name: z.string().trim().min(1, "Full name is required."),
  role: z.enum(["admin", "cashier"]),
});

export const updateUserBodySchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required.")
    .regex(/^[a-z0-9_.]+$/i, "Letters, numbers, dots and underscores only."),
  name: z.string().trim().min(1, "Full name is required."),
  role: z.enum(["admin", "cashier"]),
});

export const resetPasswordBodySchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const setActiveBodySchema = z.object({
  isActive: z.boolean(),
});
