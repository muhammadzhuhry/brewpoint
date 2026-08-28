import { test, expect } from "@playwright/test";
import { CASHIER_CREDENTIALS } from "./fixtures";

// Flow 1 (PRD "User Flows" / TODO.md 3.5): Staff Login — correct + incorrect credentials.
test.describe("Login", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("shows an inline error on wrong credentials and keeps the form editable", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByLabel("Username").fill("admin");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(
      page.getByText("Incorrect username or password."),
    ).toBeVisible();

    // Form must remain editable / on the login screen — no navigation happened.
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel("Username")).toBeEditable();
  });

  test("admin login redirects to the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username").fill("admin");
    await page.getByLabel("Password").fill("admin123");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText(/Welcome back/)).toBeVisible();
    await page.waitForURL(/\/dashboard$/, { timeout: 5000 });
  });

  test("cashier login redirects to checkout", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username").fill(CASHIER_CREDENTIALS.username);
    await page.getByLabel("Password").fill(CASHIER_CREDENTIALS.password);
    await page.getByRole("button", { name: "Log in" }).click();

    await page.waitForURL(/\/checkout$/, { timeout: 5000 });
  });
});
