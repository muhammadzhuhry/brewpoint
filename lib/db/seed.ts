import { db } from "@/lib/db";
import { users, categories, products } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";

async function main() {
  const adminPasswordHash = await hashPassword("admin123");

  const [admin] = await db
    .insert(users)
    .values({
      username: "admin",
      passwordHash: adminPasswordHash,
      name: "Marcus Bell",
      role: "admin",
    })
    .returning();

  const [espresso, pastry] = await db
    .insert(categories)
    .values([{ name: "Espresso" }, { name: "Pastry" }])
    .returning();

  await db.insert(products).values([
    {
      name: "Cappuccino",
      price: "4.25",
      stockQuantity: 36,
      categoryId: espresso.id,
      barcode: "7850021401",
    },
    {
      name: "Caffè Latte",
      price: "4.75",
      stockQuantity: 41,
      categoryId: espresso.id,
      barcode: "7850021418",
    },
    {
      name: "Butter Croissant",
      price: "3.75",
      stockQuantity: 18,
      categoryId: pastry.id,
      barcode: "7850021517",
    },
  ]);

  console.log("Seed complete. Admin username:", admin.username);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
