import { beforeEach, describe, expect, test } from "bun:test";
import { STORAGE_KEYS } from "../../src/lib/state/persistence";
import {
  appState,
  dismissToast,
  pushToast,
  setCurrentDigitIdx,
  setInput,
  setMode,
  setPlayback,
  setSettings,
} from "../../src/lib/state/store";

describe("appStore", () => {
  beforeEach(() => {
    localStorage.clear();
    setInput("");
    setPlayback("idle");
    dismissToast();
  });

  test("setInput normalizes via normalizer", () => {
    setInput("+81-90-1234");
    expect(appState.hadInternationalPrefix).toBe(true);
    expect(appState.digits).toBe("81901234");
  });

  test("setMode persists to localStorage", () => {
    setMode("modern");
    expect(localStorage.getItem(STORAGE_KEYS.mode)).toBe("modern");
    expect(localStorage.getItem(STORAGE_KEYS.schemaVersion)).toBe("1");
  });

  test("setSettings persists", () => {
    setSettings({ toneDurationMs: 200 });
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    expect(raw).toContain("200");
  });

  test("input is not persisted", () => {
    setInput("09012345678");
    expect(localStorage.getItem("dtmf:raw")).toBeNull();
    expect(localStorage.getItem("dtmf:digits")).toBeNull();
  });

  test("toast lifecycle", () => {
    pushToast({ kind: "info", message: "test" });
    expect(appState.toast?.message).toBe("test");
    dismissToast();
    expect(appState.toast).toBeNull();
  });

  test("playback and digit index", () => {
    setPlayback("auto_running");
    setCurrentDigitIdx(2);
    expect(appState.playback).toBe("auto_running");
    expect(appState.currentDigitIdx).toBe(2);
  });
});
