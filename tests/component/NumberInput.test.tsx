import { describe, expect, test } from "bun:test";
import { historyItemLabel, isClearDisabled } from "../../src/islands/NumberInput";
import { appState, setInput } from "../../src/lib/state/store";

describe("NumberInput integration", () => {
  test("input normalization updates store", () => {
    setInput("+1-800-555-0123");
    expect(appState.digits).toBe("18005550123");
    expect(appState.display).toContain("+");
  });

  test("truncation triggers warn state in store path", () => {
    setInput("1".repeat(70));
    expect(appState.digits.length).toBe(64);
  });

  test("history items include visible index labels", () => {
    expect(historyItemLabel(0)).toBe("HISTORY 01");
    expect(historyItemLabel(4)).toBe("HISTORY 05");
  });
});

describe("Clear button (F-019)", () => {
  test("isClearDisabled is true when display is empty", () => {
    expect(isClearDisabled("", "idle")).toBe(true);
  });

  test("isClearDisabled is false when there is input and playback is idle", () => {
    expect(isClearDisabled("123", "idle")).toBe(false);
  });

  test("isClearDisabled is true while playback is auto_running", () => {
    expect(isClearDisabled("123", "auto_running")).toBe(true);
  });

  test("isClearDisabled is true while playback is auto_paused", () => {
    expect(isClearDisabled("123", "auto_paused")).toBe(true);
  });

  test("isClearDisabled is true while playback is key_held", () => {
    expect(isClearDisabled("123", "key_held")).toBe(true);
  });

  test("setInput('') resets all input fields (used by Clear)", () => {
    setInput("+81-90-1234");
    expect(appState.display.length).toBeGreaterThan(0);
    setInput("");
    expect(appState.raw).toBe("");
    expect(appState.display).toBe("");
    expect(appState.digits).toBe("");
    expect(appState.hadInternationalPrefix).toBe(false);
  });

  test("NumberInput source contains the Clear button with data-testid and aria-label", async () => {
    const src = await Bun.file("src/islands/NumberInput.tsx").text();
    expect(src).toContain('data-testid="clear-button"');
    expect(src).toContain('aria-label="入力をクリア"');
    expect(src).toContain('onClick={() => setInput("")}');
    expect(src).toContain("isClearDisabled(");
  });
});
