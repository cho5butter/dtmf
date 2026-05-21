import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { waitForPhoneAppHydrated } from "./helpers";

test("has no axe violations", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByTestId("phone-app")).toBeVisible();
  await waitForPhoneAppHydrated(page);
  const results = await new AxeBuilder({ page })
    .disableRules(["scrollable-region-focusable"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("keyboard navigation reaches controls", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByTestId("phone-app")).toBeVisible();
  await waitForPhoneAppHydrated(page);
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("phone-input")).toBeFocused();
});
