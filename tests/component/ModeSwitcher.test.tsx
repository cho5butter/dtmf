import { describe, expect, test } from "bun:test";
import { STORAGE_KEYS } from "../../src/lib/state/persistence";
import { appState, setMode } from "../../src/lib/state/store";

describe("ModeSwitcher integration", () => {
  test("setMode persists to localStorage", () => {
    localStorage.clear();
    setMode("rotary");
    expect(appState.mode).toBe("rotary");
    expect(localStorage.getItem(STORAGE_KEYS.mode)).toBe("rotary");
  });
});
