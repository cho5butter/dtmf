import { expect, test } from "@playwright/test";
import { waitForPhoneAppHydrated } from "./helpers";

test("auto dial highlights digits", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByTestId("phone-app")).toBeVisible();
  await waitForPhoneAppHydrated(page);
  await page.getByTestId("phone-input").fill("123");
  await page.getByRole("button", { name: "番号をすべて再生" }).click();
  await page.waitForTimeout(800);
  await page.getByTestId("stop-button").click();
  await expect(page.getByTestId("phone-app")).toBeVisible();
});

test("auto dial stores recent history", async ({ page }) => {
  await page.goto("./");
  await waitForPhoneAppHydrated(page);
  await page.getByTestId("phone-input").fill("090-1234-5678");
  await page.getByRole("button", { name: "番号をすべて再生" }).click();
  await expect(page.getByRole("button", { name: "履歴から 09012345678 を入力" })).toBeVisible();
});
