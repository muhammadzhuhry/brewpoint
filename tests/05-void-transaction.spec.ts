import { test, expect, request as pwRequest } from "@playwright/test";
import path from "path";

const ADMIN_STATE = path.join(__dirname, ".auth", "admin.json");
test.use({ storageState: ADMIN_STATE });

// Admin voids a completed transaction; stock is restored and the product is sellable again.
test("admin voids a transaction and stock is restored", async ({ page }) => {
  const api = await pwRequest.newContext({ storageState: ADMIN_STATE });

  const productsRes = await api.get(
    "/api/v1/products?search=Caff%C3%A8%20Latte&pageSize=1",
  );
  const productsBody = await productsRes.json();
  const product = productsBody.data.items[0];
  const stockBefore: number = product.stockQuantity;

  const checkoutRes = await api.post("/api/v1/transactions", {
    data: {
      items: [{ productId: product.id, quantity: 1 }],
      amountReceived: product.price,
    },
  });
  expect(checkoutRes.ok()).toBeTruthy();
  const transaction = (await checkoutRes.json()).data;
  const receiptRef = String(transaction.id).slice(0, 8).toUpperCase();

  // Confirm the sale actually took stock before we try to void it.
  const midRes = await api.get(`/api/v1/products?search=Caff%C3%A8%20Latte&pageSize=1`);
  const midBody = await midRes.json();
  expect(midBody.data.items[0].stockQuantity).toBe(stockBefore - 1);
  await api.dispose();

  await page.goto("/transactions");
  const row = page.locator("tbody tr", { hasText: receiptRef });
  await expect(row).toBeVisible();
  await row.click();

  await expect(page.getByRole("button", { name: "Void this transaction" })).toBeVisible();
  await page.getByRole("button", { name: "Void this transaction" }).click();

  await page.getByRole("button", { name: "Cashier error" }).click();
  await page.getByRole("button", { name: "Void transaction" }).click();

  await expect(page.getByText("Transaction voided")).toBeVisible();

  // Stock restored back to the pre-sale level.
  await page.goto("/products");
  await page.getByPlaceholder("Search by name or barcode…").fill("Caffè Latte");
  const productRow = page.locator("tbody tr", { hasText: "Caffè Latte" });
  await expect(productRow.locator("td").nth(3)).toHaveText(String(stockBefore));
});
