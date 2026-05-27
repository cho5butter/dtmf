import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createDtmfEngine } from "../../src/lib/dtmf/engine";
import { DEFAULT_PERSISTED } from "../../src/lib/state/persistence";
import { FakeAudioContext } from "../helpers/FakeAudioContext";

const ROOT = join(import.meta.dir, "../..");

/**
 * B-10 回帰テスト群。
 *
 * `engine.setVolume(v)` は内部で `v²` の知覚音量補正を行う仕様（`engine.test.ts` で固定）。
 * したがって呼び出し側（`PhoneApp.tsx` onMount / `SettingsPanel.tsx` onInput）は
 * 線形の UI 音量値（0〜1）をそのまま渡さなければならない。
 *
 * - 呼び出し側が `v ** 2` / `v * v` のように事前二乗すると、最終 `masterGain` が `v⁴` になり、
 *   デフォルト 50% で 6.25% gain となって iOS の Web Audio 出力では事実上無音になる。
 */
describe("B-10 volume call-site contract (source-level guard)", () => {
  test("PhoneApp.tsx onMount passes linear settings.volume to engine.setVolume (no `** 2`)", () => {
    const src = readFileSync(join(ROOT, "src/islands/PhoneApp.tsx"), "utf-8");
    // 該当行を抜き出して検査（`engine.setVolume(...)` のうち onMount の初期化呼び出し）
    const matches = src.match(/engine\.setVolume\([^)]*\)/g) ?? [];
    expect(matches.length).toBeGreaterThan(0);
    for (const call of matches) {
      // バグ表現の禁則: `** 2` / `* appState.settings.volume` / `v * v` を含まない
      expect(call.includes("** 2")).toBe(false);
      expect(call.match(/\*\s*appState\.settings\.volume/)).toBeNull();
      expect(call.match(/\bv\s*\*\s*v\b/)).toBeNull();
    }
  });

  test("SettingsPanel.tsx onInput passes linear slider value to engine.setVolume (no `v * v`)", () => {
    const src = readFileSync(join(ROOT, "src/islands/SettingsPanel.tsx"), "utf-8");
    const matches = src.match(/engine\.setVolume\([^)]*\)/g) ?? [];
    expect(matches.length).toBeGreaterThan(0);
    for (const call of matches) {
      expect(call.includes("** 2")).toBe(false);
      expect(call.match(/\bv\s*\*\s*v\b/)).toBeNull();
    }
  });

  test("default settings.volume = 0.5 yields gain 0.25 when passed linearly", async () => {
    const fake = new FakeAudioContext();
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    // 修正後の呼び出し側がやるべきこと: 線形値 (`DEFAULT_PERSISTED.settings.volume`) をそのまま渡す
    engine.setVolume(DEFAULT_PERSISTED.settings.volume);
    engine.pressKey("0");
    const master = fake.createdNodes.gains[0];
    expect(master?.gain.value).toBe(0.25);
  });
});
