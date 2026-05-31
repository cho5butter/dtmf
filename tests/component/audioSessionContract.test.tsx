import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "../..");

/**
 * B-11 ソースレベル契約テスト。
 *
 * 「スマホの本体スピーカーから音が流れない」問題に対する 2 点の対策が
 * コードから外れていないことを保証する:
 *   1. エンジンが iOS サイレントスイッチ対策として audioSession=playback を設定する
 *   2. PhoneApp が onMount で AudioContext の suspended 状態を観測し、
 *      「音を有効にしてください」バナーを出せるようにする
 */
describe("B-11 mobile speaker audio contract (source-level guard)", () => {
  test("engine.ts configures audioSession=playback for the iOS silent switch", () => {
    const src = readFileSync(join(ROOT, "src/lib/dtmf/engine.ts"), "utf-8");
    expect(src.includes("configureAudioSessionForPlayback")).toBe(true);
  });

  test("PhoneApp.tsx observes the AudioContext state at mount to surface the activation banner", () => {
    const src = readFileSync(join(ROOT, "src/islands/PhoneApp.tsx"), "utf-8");
    expect(src.includes("getContextState")).toBe(true);
    expect(src.includes("setContextSuspended")).toBe(true);
  });
});
