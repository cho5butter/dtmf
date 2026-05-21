import { describe, expect, test } from "bun:test";
import { DTMF_FREQUENCY_MAP } from "../../src/lib/dtmf/frequencyMap";

describe("DetailPanel integration", () => {
  test("digit 2 maps to 697/1336", () => {
    expect(DTMF_FREQUENCY_MAP["2"]).toEqual({ low: 697, high: 1336 });
  });
});
