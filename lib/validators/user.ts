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
