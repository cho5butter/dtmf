import { describe, expect, test } from "bun:test";
import { appState, dismissToast, pushToast } from "../../src/lib/state/store";

describe("Toast integration", () => {
  test("push and dismiss toast", () => {
    pushToast({ kind: "warn", message: "警告テスト" });
    expect(appState.toast?.message).toBe("警告テスト");
    dismissToast();
    expect(appState.toast).toBeNull();
  });
});
