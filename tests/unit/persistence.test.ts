import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  DEFAULT_PERSISTED,
  loadDialHistory,
  loadPersistedState,
  loadSoundWarningAck,
  rememberDialHistory,
  SCHEMA_VERSION,
  STORAGE_KEYS,
  saveSoundWarningAck,
} from "../../src/lib/state/persistence";

describe("persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("returns defaults when empty", () => {
    const state = loadPersistedState();
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.mode).toBe("retro");
  });

  test("ignores invalid schema version", () => {
    localStorage.setItem(STORAGE_KEYS.schemaVersion, "999");
    localStorage.setItem(STORAGE_KEYS.mode, "rotary");
    const state = loadPersistedState();
    expect(state.mode).toBe("retro");
  });

  test("falls back to retro when removed modern mode is persisted", () => {
    localStorage.setItem(STORAGE_KEYS.schemaVersion, String(SCHEMA_VERSION));
    localStorage.setItem(STORAGE_KEYS.mode, "modern");
    const state = loadPersistedState();
    expect(state.mode).toBe("retro");
  });

  test("remembers the latest five dialed numbers with newest first", () => {
    for (const value of ["111", "222", "333", "444", "555", "666", "333"]) {
      rememberDialHistory(value);
    }
    expect(loadDialHistory()).toEqual(["333", "666", "555", "444", "222"]);
  });

  test("writes schema version on save via setMode in store tests", () => {
    expect(DEFAULT_PERSISTED.schemaVersion).toBe(1);
  });
});

describe("sound warning acknowledgement persistence (F-020)", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.soundWarningAck);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEYS.soundWarningAck);
  });

  test("loadSoundWarningAck is false when nothing is stored (first access)", () => {
    expect(loadSoundWarningAck()).toBe(false);
  });

  test("saveSoundWarningAck persists the flag and loadSoundWarningAck returns true", () => {
    saveSoundWarningAck();
    expect(loadSoundWarningAck()).toBe(true);
  });

  test("uses a schema-version-independent storage key", () => {
    expect(STORAGE_KEYS.soundWarningAck).toBe("dtmf:soundWarningAck");
  });

  test("does not throw and returns false when localStorage access fails", () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new Error("localStorage blocked");
      },
    });
    try {
      expect(() => saveSoundWarningAck()).not.toThrow();
      expect(loadSoundWarningAck()).toBe(false);
    } finally {
      if (original) Object.defineProperty(globalThis, "localStorage", original);
    }
  });
});
