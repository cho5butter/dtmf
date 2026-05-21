import { describe, expect, test } from "bun:test";
import { computeEnvelopePoints } from "../../src/lib/dtmf/envelope";

describe("envelope", () => {
  test("attack 8ms and release 8ms ramp", () => {
    const points = computeEnvelopePoints(0, 150, 1);
    expect(points[0]).toEqual({ time: 0, gain: 0 });
    expect(points[1]?.time).toBeCloseTo(0.008, 4);
    expect(points[1]?.gain).toBe(1);
    expect(points.at(-1)?.gain).toBe(0);
  });

  test("short duration scales peak gain", () => {
    const points = computeEnvelopePoints(0, 10, 1, 8, 8);
    expect(points[1]?.gain).toBeLessThan(1);
    expect(points[1]?.gain).toBeGreaterThan(0);
  });

  test("gain zero returns flat zero", () => {
    const points = computeEnvelopePoints(0, 150, 0);
    expect(points.every((p) => p.gain === 0)).toBe(true);
  });

  test("rejects negative parameters", () => {
    expect(() => computeEnvelopePoints(0, -1, 1)).toThrow(RangeError);
    expect(() => computeEnvelopePoints(0, 150, -0.1)).toThrow(RangeError);
  });
});
