import { describe, expect, test } from "bun:test";
import {
  angleToDigit,
  digitToAngle,
  fingerStopAngle,
  returnAngle,
} from "../../src/lib/dtmf/rotaryAngle";

describe("rotaryAngle", () => {
  test("digitToAngle and angleToDigit round trip", () => {
    expect(digitToAngle("5")).toBe(180);
    expect(angleToDigit("180")).toBe("5");
  });

  test("finger stop and return", () => {
    const stop = fingerStopAngle(90);
    expect(returnAngle(stop)).toBe(90);
  });

  test("invalid digit throws", () => {
    expect(() => digitToAngle("x")).toThrow(RangeError);
  });
});
