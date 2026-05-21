import { expect, test } from "@playwright/test";

test("auto dial highlights digits", async ({ page }) => {
  await page.goto("./");
  await page.getByTestId("phone-input").fill("123");
  await page.getByRole("button", { name: "自動ダイヤル" }).click();
  await page.waitForTimeout(800);
  await page.getByTestId("stop-button").click();
  await expect(page.getByTestId("phone-app")).toBeVisible();
});
