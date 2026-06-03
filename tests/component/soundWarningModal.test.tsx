import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { shouldShowSoundWarning } from "../../src/islands/SoundWarningModal";
import { STORAGE_KEYS } from "../../src/lib/state/persistence";

describe("SoundWarningModal display logic (F-020)", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.soundWarningAck);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEYS.soundWarningAck);
  });

  test("shows the modal on first access (no acknowledgement stored)", () => {
    expect(shouldShowSoundWarning()).toBe(true);
  });

  test("does not show the modal once acknowledgement is stored", () => {
    localStorage.setItem(STORAGE_KEYS.soundWarningAck, "1");
    expect(shouldShowSoundWarning()).toBe(false);
  });
});

describe("SoundWarningModal markup contract (F-020 / a11y)", () => {
  test("source declares dialog role, aria-modal and required test ids", async () => {
    const src = await Bun.file("src/islands/SoundWarningModal.tsx").text();
    expect(src).toContain('role="dialog"');
    expect(src).toContain('aria-modal="true"');
    expect(src).toContain('data-testid="sound-warning-modal"');
    expect(src).toContain('data-testid="sound-warning-ok"');
    expect(src).toContain("saveSoundWarningAck");
    expect(src).toContain("Escape");
  });

  test("warns explicitly that the app makes sound", async () => {
    const src = await Bun.file("src/islands/SoundWarningModal.tsx").text();
    expect(src).toContain("音");
  });

  test("is mounted by PhoneApp", async () => {
    const src = await Bun.file("src/islands/PhoneApp.tsx").text();
    expect(src).toContain("SoundWarningModal");
  });
});
