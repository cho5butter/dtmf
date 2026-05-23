import { describe, expect, test } from "bun:test";
import {
  angleToDigit,
  digitToAngle,
  fingerStopAngle,
  returnAngle,
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

  test("invalid digit throws", () => {
    expect(() => digitToAngle("x")).toThrow(RangeError);
  });
});
