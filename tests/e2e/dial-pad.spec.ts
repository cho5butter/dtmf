import { expect, test } from "@playwright/test";

test("dial pad key press", async ({ page }) => {
  await page.goto("./");
  await page.getByLabel("ダイヤルキー 5").click();
  await expect(page.getByTestId("dial-pad")).toBeVisible();
});

test("keyboard digit", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("7");
  await expect(page.getByTestId("phone-app")).toBeVisible();
});
