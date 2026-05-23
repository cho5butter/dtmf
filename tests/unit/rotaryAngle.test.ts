import { describe, expect, test } from "bun:test";
import {
  angleToDigit,
  digitToAngle,
  fingerStopAngle,
  pulseCount,
  returnAngle,
  returnDurationMs,
  rotationKeyframes,
} from "../../src/lib/dtmf/rotaryAngle";

describe("rotaryAngle", () => {
  test("digitToAngle and angleToDigit round trip", () => {
    expect(digitToAngle("5")).toBe(180);
    expect(angleToDigit(180)).toBe("5");
  });

  test("zero has the longest black-phone travel", () => {
    expect(digitToAngle("1")).toBe(36);
    expect(digitToAngle("9")).toBe(324);
    expect(digitToAngle("0")).toBe(360);
    expect(fingerStopAngle(digitToAngle("0"))).toBeGreaterThan(fingerStopAngle(digitToAngle("9")));
    expect(angleToDigit(360)).toBe("0");
  });

  test("finger stop sits halfway between adjacent digit holes (real-phone offset)", () => {
    // 実機の止め金は数字穴と次の穴の中間 (= 半ステップ = 18°) にある
    expect(fingerStopAngle(digitToAngle("1"))).toBe(54);
    expect(fingerStopAngle(digitToAngle("5"))).toBe(198);
    expect(fingerStopAngle(digitToAngle("0"))).toBe(378);
  });

  test("finger stop and return", () => {
    const stop = fingerStopAngle(90);
    expect(returnAngle(stop)).toBe(0);
  });

  test("finger stop always adds travel beyond the selected digit", () => {
    expect(fingerStopAngle(digitToAngle("5"))).toBeGreaterThan(digitToAngle("5"));
  });

  test("rotation keyframes split long travel into visible steps", () => {
    expect(rotationKeyframes(0, 370)).toEqual([0, 90, 180, 270, 360, 370]);
    expect(rotationKeyframes(370, 0)).toEqual([370, 280, 190, 100, 10, 0]);
  });

  test("pulseCount matches real-phone pulse counts (1..9 = N, 0 = 10)", () => {
    expect(pulseCount("1")).toBe(1);
    expect(pulseCount("5")).toBe(5);
    expect(pulseCount("9")).toBe(9);
    expect(pulseCount("0")).toBe(10);
  });

  test("returnDurationMs scales with pulse count (≈ 100ms / pulse)", () => {
    expect(returnDurationMs("1")).toBe(100);
    expect(returnDurationMs("5")).toBe(500);
    expect(returnDurationMs("0")).toBe(1000);
    expect(returnDurationMs("3", 90)).toBe(270);
  });

  test("invalid digit throws", () => {
    expect(() => digitToAngle("x")).toThrow(RangeError);
    expect(() => pulseCount("x")).toThrow(RangeError);
  });
});
