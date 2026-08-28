import { test, expect } from "@playwright/test";
import path from "path";

test.use({ storageState: path.join(__dirname, ".auth", "admin.json") });

// Log out, confirm the session is cleared and protected pages redirect to login.
test("logout clears the session and protected pages redirect to login", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // Open the account panel logout control and confirm.
  await page.getByRole("button").filter({ has: page.locator("svg.lucide-log-out") }).click();
  await expect(page.getByText("Log out?")).toBeVisible();
  await page.getByRole("button", { name: "Log out" }).click();

  await page.waitForURL(/\/login$/, { timeout: 5000 });

  // Session is gone — a protected page bounces straight back to /login.
  await page.goto("/dashboard");
  await page.waitForURL(/\/login$/, { timeout: 5000 });
});
