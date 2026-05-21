import { describe, expect, test } from "bun:test";
import { normalizePhoneNumber } from "../../src/lib/input/normalizer";
import { setInput } from "../../src/lib/state/store";

describe("PlaybackControls integration", () => {
  test("empty digits after normalize blocks dial", () => {
    setInput("---");
    const r = normalizePhoneNumber("---");
    expect(r.digits).toBe("");
  });
});
