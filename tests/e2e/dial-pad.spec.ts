import { expect, test } from "@playwright/test";
import { waitForPhoneAppHydrated } from "./helpers";

test("dial pad key press", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByTestId("dial-pad")).toBeVisible();
  await page.getByLabel("ダイヤルキー 5").click();
});

test("keyboard digit", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByTestId("phone-app")).toBeVisible();
  await waitForPhoneAppHydrated(page);
  await page.keyboard.press("7");
});
