import { describe, expect, test } from "bun:test";
import { appState, setSettings } from "../../src/lib/state/store";

describe("SettingsPanel integration", () => {
  test("setSettings updates tone duration", () => {
    setSettings({ toneDurationMs: 200 });
    expect(appState.settings.toneDurationMs).toBe(200);
  });
});
