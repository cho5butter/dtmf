import { expect, test } from "@playwright/test";

test("switches UI modes", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "モダン" }).click();
  await expect(page.getByTestId("modern-pad")).toBeVisible();
  await page.getByRole("button", { name: "回転" }).click();
  await expect(page.getByTestId("rotary-dial")).toBeVisible();
});
