import { expect, test } from "@playwright/test";
import { waitForPhoneAppHydrated } from "./helpers";

test("switches UI modes", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByTestId("phone-app")).toBeVisible();
  await waitForPhoneAppHydrated(page);
  const modeSwitcher = page.getByTestId("mode-switcher");
  await expect(async () => {
    await modeSwitcher.getByRole("button", { name: "モダン", exact: true }).click();
    await expect(page.getByTestId("modern-pad")).toBeVisible();
  }).toPass();
  await expect(async () => {
    await modeSwitcher.getByRole("button", { name: "回転", exact: true }).click();
    await expect(page.getByTestId("rotary-dial")).toBeVisible();
  }).toPass();
});
