import type { Page } from "@playwright/test";

/** Open a base-ui/shadcn <Select> by its trigger id and click the option with this exact text. */
export async function selectOption(page: Page, triggerId: string, optionText: string) {
  await page.locator(`#${triggerId}`).click();
  await page.getByRole("option", { name: optionText, exact: true }).click();
}

/** Dismiss any sonner toast currently on screen isn't necessary — toasts auto-expire; this just waits for one with the given text to appear. */
export async function expectToast(page: Page, text: string | RegExp) {
  await page.getByText(text).first().waitFor({ state: "visible", timeout: 10_000 });
}

export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now()}`;
}
