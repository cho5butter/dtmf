import { expect, test } from "@playwright/test";
import { waitForPhoneAppHydrated } from "./helpers";

test("pad records on press and plays on release", async ({ page }) => {
  await page.goto("./");
  await waitForPhoneAppHydrated(page);
  await page.getByTestId("phone-input").fill("");

  const key5 = page.getByRole("button", { name: "ダイヤルキー 5" });
  await key5.dispatchEvent("pointerdown");
  await expect(page.getByTestId("phone-input")).toHaveValue("5");
  await key5.dispatchEvent("pointerup");

  await expect(page.getByTestId("phone-input")).toHaveValue("5");
});

test("rotary records digit before release playback", async ({ page }) => {
  await page.goto("./");
  await waitForPhoneAppHydrated(page);
  await page.getByTestId("phone-input").fill("");
  await page
    .getByTestId("mode-switcher")
    .getByRole("button", { name: "回転", exact: true })
    .click();
  await page.getByLabel("回転ダイヤル 5").click();
  await expect(page.getByTestId("phone-input")).toHaveValue("5", { timeout: 3000 });
});
