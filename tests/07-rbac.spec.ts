import { test, expect } from "@playwright/test";
import path from "path";

test.use({ storageState: path.join(__dirname, ".auth", "cashier.json") });

// Cashier attempts to access an admin-only page (Users) directly by URL — confirm they're blocked.
test("cashier is redirected away from the admin-only Users page", async ({
  page,
}) => {
  await page.goto("/users");
  await page.waitForURL(/\/checkout$/, { timeout: 5000 });
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
});

test("cashier is redirected away from the admin-only Stock page", async ({
  page,
}) => {
  await page.goto("/stock");
  await page.waitForURL(/\/checkout$/, { timeout: 5000 });
});

test("Users nav item is not shown in the cashier's sidebar", async ({
  page,
}) => {
  await page.goto("/checkout");
  await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
});
