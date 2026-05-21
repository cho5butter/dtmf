import { describe, expect, test } from "bun:test";
import { normalizePhoneNumber } from "../../src/lib/input/normalizer";

describe("normalizePhoneNumber", () => {
  test("extracts allowed digits only", () => {
    const r = normalizePhoneNumber("03-1234-5678");
    expect(r.digits).toBe("0312345678");
    expect(r.display).toBe("0312345678");
  });

  test("keeps leading plus in display only", () => {
    const r = normalizePhoneNumber("+1-800-555-0123");
    expect(r.display).toBe("+18005550123");
    expect(r.digits).toBe("18005550123");
    expect(r.hadInternationalPrefix).toBe(true);
  });

  test("removes vanity letters", () => {
    const r = normalizePhoneNumber("1-800-FLOWERS");
    expect(r.digits).toBe("1800");
  });

  test("normalizes fullwidth digits", () => {
    const r = normalizePhoneNumber("０３１２３");
    expect(r.digits).toBe("03123");
  });

  test("truncates beyond 64 digits", () => {
    const r = normalizePhoneNumber("1".repeat(70));
    expect(r.digits.length).toBe(64);
    expect(r.truncated).toBe(true);
  });

  test("empty input", () => {
    const r = normalizePhoneNumber("---");
    expect(r.digits).toBe("");
  });
});
