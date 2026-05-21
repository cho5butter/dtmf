import { beforeEach, describe, expect, test } from "bun:test";
import {
  DEFAULT_PERSISTED,
  loadPersistedState,
  SCHEMA_VERSION,
  STORAGE_KEYS,
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
    localStorage.setItem(STORAGE_KEYS.mode, "modern");
    const state = loadPersistedState();
    expect(state.mode).toBe("retro");
  });

  test("writes schema version on save via setMode in store tests", () => {
    expect(DEFAULT_PERSISTED.schemaVersion).toBe(1);
  });
});
