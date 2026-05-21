import { expect, test } from "@playwright/test";
import { waitForPhoneAppHydrated } from "./helpers";

test("switches UI modes", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByTestId("phone-app")).toBeVisible();
  await waitForPhoneAppHydrated(page);
  await expect(async () => {
    await page.getByRole("button", { name: "モダン" }).click();
    await expect(page.getByTestId("modern-pad")).toBeVisible();
    await expect(page.getByRole("button", { name: "モダン" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  }).toPass();
  await expect(async () => {
    await page.getByRole("button", { name: "回転" }).click();
    await expect(page.getByTestId("rotary-dial")).toBeVisible();
    await expect(page.getByRole("button", { name: "回転" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  }).toPass();
});
