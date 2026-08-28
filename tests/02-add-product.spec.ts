import { test, expect } from "@playwright/test";
import path from "path";
import { selectOption, uniqueName } from "./utils";

test.use({ storageState: path.join(__dirname, ".auth", "admin.json") });

// Flow 2: Admin adds a new product, sees it appear in the POS product grid.
test("admin adds a new product and it appears in the POS grid", async ({
  page,
}) => {
  const productName = uniqueName("Playwright Croissant");

  await page.goto("/products");
  await page.getByRole("button", { name: "Add product" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Product name").fill(productName);
  await selectOption(page, "product-category", "Pastry");
  await dialog.getByLabel(/Price/).fill("3.50");
  await dialog.getByLabel("Stock quantity").fill("12");

  await dialog.getByRole("button", { name: "Add product" }).click();

  await expect(page.getByText("Product created")).toBeVisible();

  // Confirm it now shows up in the admin product list.
  await page.getByPlaceholder("Search by name or barcode…").fill(productName);
  await expect(page.locator("tbody tr", { hasText: productName })).toBeVisible();

  // And that it's sellable on the POS/checkout screen.
  await page.goto("/checkout");
  await page
    .getByPlaceholder("Search products or scan barcode…")
    .fill(productName);
  await expect(page.getByRole("button", { name: new RegExp(productName) })).toBeVisible();
});
