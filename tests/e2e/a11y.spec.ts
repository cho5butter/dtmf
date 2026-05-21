import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("has no axe violations", async ({ page }) => {
  await page.goto("./");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("keyboard navigation reaches controls", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("phone-input")).toBeFocused();
});
