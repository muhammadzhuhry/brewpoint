import { test, expect } from "@playwright/test";
import path from "path";

test.use({ storageState: path.join(__dirname, ".auth", "admin.json") });

// Flow 4: Admin reviews the sales dashboard for today, then changes the date range.
test("admin reviews today's dashboard, then switches date range", async ({
  page,
}) => {
  await page.goto("/dashboard");

  const main = page.getByRole("main");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(main.getByText("Total sales")).toBeVisible();
  await expect(main.getByText("Transactions")).toBeVisible();
  await expect(main.getByText("Avg. ticket")).toBeVisible();

  // Defaults to "Today".
  const todayBtn = page.getByRole("button", { name: "Today" });
  await expect(todayBtn).toBeVisible();

  // Switch to 7 days, then 30 days — figures should refresh without error.
  await page.getByRole("button", { name: "7 days" }).click();
  await expect(page.getByText("vs last week").first()).toBeVisible();

  await page.getByRole("button", { name: "30 days" }).click();
  await expect(page.getByText("vs prev. 30 days").first()).toBeVisible();

  await page.getByRole("button", { name: "Today" }).click();
  await expect(page.getByText("vs yesterday").first()).toBeVisible();
});

test("cashier cannot reach the dashboard", async ({ browser }) => {
  const cashierState = path.join(__dirname, ".auth", "cashier.json");
  const context = await browser.newContext({ storageState: cashierState });
  const page = await context.newPage();

  await page.goto("/dashboard");
  await page.waitForURL(/\/checkout$/, { timeout: 5000 });

  await context.close();
});
