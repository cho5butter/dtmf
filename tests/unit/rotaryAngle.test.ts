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
  test("digitToAngle and angleToDigit round trip (30°/step)", () => {
    expect(digitToAngle("5")).toBe(150);
    expect(angleToDigit(150)).toBe("5");
  });

  test("zero has the longest black-phone travel (NTT 600 形・30°×10+30°=330°)", () => {
    expect(digitToAngle("1")).toBe(30);
    expect(digitToAngle("9")).toBe(270);
    expect(digitToAngle("0")).toBe(300);
    expect(fingerStopAngle(digitToAngle("0"))).toBeGreaterThan(fingerStopAngle(digitToAngle("9")));
    expect(angleToDigit(300)).toBe("0");
  });

  test("finger stop is one step (30°) beyond the dialed digit's hole (P3-12)", () => {
    // 実機（フェイス 1=2時 / 0=5時 / 止め金 4時）の物理対応:
    // 止め金は数字穴 N から CW に (N+1) ステップ先にあり、回転量 = N×30° + 30°。
    // よって fingerStopAngle(digitToAngle(N)) === digitToAngle(N) + 30°。
    expect(fingerStopAngle(digitToAngle("1"))).toBe(60);
    expect(fingerStopAngle(digitToAngle("5"))).toBe(180);
    expect(fingerStopAngle(digitToAngle("0"))).toBe(330);
  });

  test("finger stop and return", () => {
    const stop = fingerStopAngle(90);
    expect(stop).toBe(120);
    expect(returnAngle(stop)).toBe(0);
  });

  test("digits are spaced 30° apart (not 36°): 10 holes occupy only 270° of arc", () => {
    // 隣接する数字穴間の論理角差は 30° で一定。
    expect(digitToAngle("2") - digitToAngle("1")).toBe(30);
    expect(digitToAngle("9") - digitToAngle("8")).toBe(30);
    // 「1」(=30°) と「0」(=300°) の差 = 270° で、残り 90° が指止め用の隙間。
    expect(digitToAngle("0") - digitToAngle("1")).toBe(270);
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
