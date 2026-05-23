import { describe, expect, test } from "bun:test";
import { createIdleWaveformSamples } from "../../src/islands/Visualizer";
import { createDtmfEngine } from "../../src/lib/dtmf/engine";
import { FakeAudioContext } from "../helpers/FakeAudioContext";

describe("Visualizer integration", () => {
  test("engine exposes analyser after ensureContext", async () => {
    const fake = new FakeAudioContext();
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    expect(engine.getAnalyser()).not.toBeNull();
  });

  test("idle waveform is visible before audio context starts", () => {
    const samples = createIdleWaveformSamples(16);
    expect(samples).toHaveLength(16);
    expect(new Set(samples).size).toBeGreaterThan(2);
  });
});
