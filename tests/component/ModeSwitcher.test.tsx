import { describe, expect, test } from "bun:test";
import { STORAGE_KEYS } from "../../src/lib/state/persistence";
import { appState, setMode } from "../../src/lib/state/store";

describe("ModeSwitcher integration", () => {
  test("setMode persists to localStorage", () => {
    localStorage.clear();
    setMode("modern");
    expect(appState.mode).toBe("modern");
    expect(localStorage.getItem(STORAGE_KEYS.mode)).toBe("modern");
  });
});
