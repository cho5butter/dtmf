import type { Page } from "@playwright/test";

/** Solid アイランドの水和後に操作可能になるまで待つ */
export async function waitForPhoneAppHydrated(page: Page): Promise<void> {
  await page.getByTestId("mode-switcher").waitFor({ state: "visible" });
  await page.getByRole("button", { name: "モダン" }).waitFor({ state: "visible" });
}
