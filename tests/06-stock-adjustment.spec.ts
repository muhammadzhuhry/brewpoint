import { test, expect, request as pwRequest } from "@playwright/test";
import path from "path";

const ADMIN_STATE = path.join(__dirname, ".auth", "admin.json");
test.use({ storageState: ADMIN_STATE });

// Admin performs a manual stock adjustment; it reflects immediately in the product list.
test("admin records a stock increase and it reflects on the product list", async ({
  page,
}) => {
  const api = await pwRequest.newContext({ storageState: ADMIN_STATE });
  const res = await api.get(
    "/api/v1/products?search=Butter%20Croissant&pageSize=1",
  );
  const body = await res.json();
  const stockBefore: number = body.data.items[0].stockQuantity;
  await api.dispose();

  const adjustQty = 5;
  const expectedLevel = stockBefore + adjustQty;

  await page.goto("/stock");

  await page
    .getByRole("button", { name: /Butter Croissant/ })
    .click();

  // "Increase" is selected by default.
  await page.getByRole("button", { name: "Increase" }).click();
  await page
    .locator("input[placeholder='0']")
    .fill(String(adjustQty));
  await page.getByRole("button", { name: "Weekly delivery" }).click();

  await page.getByRole("button", { name: "Record adjustment" }).click();
  await expect(
    page.getByText(`New stock level`),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirm adjustment" }).click();

  await expect(
    page.getByText(`Butter Croissant now at ${expectedLevel}`),
  ).toBeVisible();

  await page.goto("/products");
  await page
    .getByPlaceholder("Search by name or barcode…")
    .fill("Butter Croissant");
  const row = page.locator("tbody tr", { hasText: "Butter Croissant" });
  await expect(row.locator("td").nth(3)).toHaveText(String(expectedLevel));
});
