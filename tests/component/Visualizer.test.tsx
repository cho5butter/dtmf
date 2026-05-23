import { describe, expect, test } from "bun:test";
import { createDtmfWaveformSamples, createIdleWaveformSamples } from "../../src/islands/Visualizer";
import { createDtmfEngine } from "../../src/lib/dtmf/engine";
import { FakeAudioContext } from "../helpers/FakeAudioContext";

describe("Visualizer integration", () => {
  test("engine exposes analyser after ensureContext", async () => {
    const fake = new FakeAudioContext();
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    expect(engine.getAnalyser()).not.toBeNull();
  });

  test("idle waveform is a silent baseline before audio context starts", () => {
    const samples = createIdleWaveformSamples(16);
    expect(samples).toHaveLength(16);
    expect(new Set(samples)).toEqual(new Set([128]));
  });

  test("dtmf fallback waveform follows the active key frequencies", () => {
    const keyOne = createDtmfWaveformSamples(64, "1", 0);
    const keyNine = createDtmfWaveformSamples(64, "9", 0);
    expect(new Set(keyOne).size).toBeGreaterThan(8);
    expect(keyOne).not.toEqual(keyNine);
  });
});
