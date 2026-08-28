import { test, expect, request as pwRequest } from "@playwright/test";
import path from "path";
import { uniqueName } from "./utils";

test.use({ storageState: path.join(__dirname, ".auth", "cashier.json") });

const ADMIN_STATE = path.join(__dirname, ".auth", "admin.json");

test.describe("Point of Sale / Checkout", () => {
  // Flow 3: Cashier completes a full checkout, stock decrements, receipt shows correctly.
  test("cashier completes a full checkout and stock decrements", async ({
    page,
  }) => {
    // Read the current stock for the seeded "Cappuccino" product before selling.
    const adminApi = await pwRequest.newContext({ storageState: ADMIN_STATE });
    const before = await adminApi.get("/api/v1/products?search=Cappuccino&pageSize=1");
    const beforeBody = await before.json();
    const stockBefore: number = beforeBody.data.items[0].stockQuantity;
    await adminApi.dispose();

    await page.goto("/checkout");
    await page
      .getByPlaceholder("Search products or scan barcode…")
      .fill("Cappuccino");

    const tile = page.getByRole("button", { name: /Cappuccino/ });
    await tile.click();
    await tile.click();

    // Cart shows 2x Cappuccino.
    await expect(page.getByText("Current order")).toBeVisible();
    const cartLine = page.locator("aside", { hasText: "Current order" });
    await expect(cartLine.getByText("Cappuccino")).toBeVisible();

    await page.getByRole("button", { name: /^Charge/ }).click();

    // Pay the exact amount due.
    await page.getByRole("button", { name: "Exact" }).click();
    await expect(page.getByText("Change due")).toBeVisible();

    await page.getByRole("button", { name: "Complete sale" }).click();

    // Receipt overlay confirms the sale.
    await expect(page.getByText("Payment complete")).toBeVisible();
    await expect(page.getByText(/2×/)).toBeVisible();
    await page.getByRole("button", { name: "New sale" }).click();
    await expect(page.getByText("Payment complete")).toHaveCount(0);

    // Stock decremented by 2 — verify from the products list.
    await page.goto("/products");
    await page.getByPlaceholder("Search by name or barcode…").fill("Cappuccino");
    const row = page.locator("tbody tr", { hasText: "Cappuccino" });
    await expect(row).toBeVisible();
    await expect(row.locator("td").nth(3)).toHaveText(String(stockBefore - 2));
  });

  // Flow 3 (error path): a product with 0 stock can't be added to the cart at checkout.
  test("an out-of-stock product is flagged and cannot be added to the cart", async ({
    page,
  }) => {
    const adminApi = await pwRequest.newContext({ storageState: ADMIN_STATE });
    const categoriesRes = await adminApi.get("/api/v1/categories");
    const categories = (await categoriesRes.json()).data as { id: string; name: string }[];
    const categoryId = categories[0].id;

    const productName = uniqueName("Zero Stock Widget");
    const createRes = await adminApi.post("/api/v1/products", {
      data: {
        name: productName,
        categoryId,
        price: "5.00",
        stockQuantity: 0,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    await adminApi.dispose();

    await page.goto("/checkout");
    await page
      .getByPlaceholder("Search products or scan barcode…")
      .fill(productName);

    const tile = page.getByRole("button", { name: new RegExp(productName) });
    await expect(tile).toBeVisible();
    await expect(tile).toBeDisabled();
    await expect(tile.getByText("Out of stock")).toBeVisible();
  });
});
