import { expect, test } from "@playwright/test";

test("rotary dial digit", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "回転" }).click();
  await page.getByLabel("回転ダイヤル 5").click();
  await expect(page.getByTestId("rotary-dial")).toBeVisible();
});
