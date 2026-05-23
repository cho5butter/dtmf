import type { Page } from "@playwright/test";

/** Solid アイランドの水和後に操作可能になるまで待つ */
export async function waitForPhoneAppHydrated(page: Page): Promise<void> {
  await page.getByTestId("phone-app").waitFor({ state: "visible" });
  await page.getByTestId("mode-switcher").waitFor({ state: "visible" });
  await page
    .getByTestId("mode-switcher")
    .getByRole("button", { name: "モダン", exact: true })
    .waitFor({
      state: "visible",
    });
}
