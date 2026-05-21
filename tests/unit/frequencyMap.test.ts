import { describe, expect, test } from "bun:test";
import { DTMF_FREQUENCY_MAP, DTMF_KEYS } from "../../src/lib/dtmf/frequencyMap";

const ITU_Q23: Record<string, { low: number; high: number }> = {
  "1": { low: 697, high: 1209 },
  "2": { low: 697, high: 1336 },
  "3": { low: 697, high: 1477 },
  "4": { low: 770, high: 1209 },
  "5": { low: 770, high: 1336 },
  "6": { low: 770, high: 1477 },
  "7": { low: 852, high: 1209 },
  "8": { low: 852, high: 1336 },
  "9": { low: 852, high: 1477 },
  "*": { low: 941, high: 1209 },
  "0": { low: 941, high: 1336 },
  "#": { low: 941, high: 1477 },
};

describe("frequencyMap", () => {
  test("has 12 keys matching ITU-T Q.23", () => {
    expect(DTMF_KEYS.length).toBe(12);
    for (const key of DTMF_KEYS) {
      expect(DTMF_FREQUENCY_MAP[key]).toEqual(ITU_Q23[key]);
    }
  });
});
