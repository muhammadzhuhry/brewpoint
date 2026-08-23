import { and, eq, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { AppError } from "@/lib/app-error";
import { hashPassword } from "@/lib/auth/password";

const safeUserColumns = {
  id: users.id,
  username: users.username,
  name: users.name,
  role: users.role,
  isActive: users.isActive,
  createdAt: users.createdAt,
};

export async function listUsers() {
  return db.select(safeUserColumns).from(users).orderBy(users.createdAt);
}

export async function getUserById(id: string) {
  const [user] = await db
    .select(safeUserColumns)
    .from(users)
    .where(eq(users.id, id));
  if (!user) throw new AppError("NOT_FOUND", "User not found.", 404);
  return user;
}

export async function createUser(input: {
  username: string;
  password: string;
  name: string;
  role: "admin" | "cashier";
}) {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.username, input.username));
  if (existing) {
    throw new AppError("CONFLICT", "Username is already taken.", 409);
  }

  const passwordHash = await hashPassword(input.password);
  const [user] = await db
    .insert(users)
    .values({
      username: input.username,
      passwordHash,
      name: input.name,
      role: input.role,
    })
    .returning(safeUserColumns);
  return user;
}

export async function updateUser(
  id: string,
  input: { username: string; name: string; role: "admin" | "cashier" },
) {
  const [existing] = await db
    .select()
    .from(users)
    .where(and(eq(users.username, input.username), ne(users.id, id)));
  if (existing) {
    throw new AppError("CONFLICT", "Username is already taken.", 409);
  }

  const [user] = await db
    .update(users)
    .set({ username: input.username, name: input.name, role: input.role })
    .where(eq(users.id, id))
    .returning(safeUserColumns);
  if (!user) throw new AppError("NOT_FOUND", "User not found.", 404);
  return user;
}

export async function resetPassword(id: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  const [user] = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, id))
    .returning(safeUserColumns);
  if (!user) throw new AppError("NOT_FOUND", "User not found.", 404);
  return user;
}

export async function setUserActive(id: string, isActive: boolean) {
  const target = await getUserById(id);

  if (!isActive && target.role === "admin") {
    const activeAdmins = await db
      .select()
      .from(users)
      .where(and(eq(users.role, "admin"), eq(users.isActive, true)));
    if (activeAdmins.length <= 1) {
      throw new AppError(
        "CONFLICT",
        "Can't deactivate the last active admin.",
        409,
      );
    }
  }

  const [user] = await db
    .update(users)
    .set({ isActive })
    .where(eq(users.id, id))
    .returning(safeUserColumns);
  return user;
}
