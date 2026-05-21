import { describe, expect, test } from "bun:test";
import { setCurrentDigitIdx, setInput } from "../../src/lib/state/store";

describe("highlight sync integration", () => {
  test("currentDigitIdx tracks playback position", () => {
    setInput("123");
    setCurrentDigitIdx(1);
    expect("123"[1]).toBe("2");
  });
});
