import { describe, expect, test } from "bun:test";
import { historyItemLabel } from "../../src/islands/NumberInput";
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
