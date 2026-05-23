import { describe, expect, test } from "bun:test";
import { recordDialKey } from "../../src/lib/state/dialActions";
import { appState, setInput } from "../../src/lib/state/store";

describe("recordDialKey", () => {
  test("appends digit to raw input without playing", () => {
    setInput("");
    recordDialKey("5");
    expect(appState.raw).toBe("5");
    recordDialKey("3");
    expect(appState.raw).toBe("53");
  });
});
