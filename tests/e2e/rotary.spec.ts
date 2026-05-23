import { expect, test } from "@playwright/test";
import { waitForPhoneAppHydrated } from "./helpers";

test("rotary dial digit", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByTestId("phone-app")).toBeVisible();
  await waitForPhoneAppHydrated(page);
  await expect(async () => {
    await page
      .getByTestId("mode-switcher")
      .getByRole("button", { name: "回転", exact: true })
      .click();
    await expect(page.getByTestId("rotary-dial")).toBeVisible();
  }).toPass();
  await page.getByLabel("回転ダイヤル 5").click();
});
