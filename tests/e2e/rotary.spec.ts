import { expect, test } from "@playwright/test";
import { waitForPhoneAppHydrated } from "./helpers";

test("rotary dial digit", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByTestId("phone-app")).toBeVisible();
  await waitForPhoneAppHydrated(page);
  await expect(async () => {
    await page.getByRole("button", { name: "回転" }).click();
    await expect(page.getByTestId("rotary-dial")).toBeVisible();
  }).toPass();
  await page.getByLabel("回転ダイヤル 5").click();
});
