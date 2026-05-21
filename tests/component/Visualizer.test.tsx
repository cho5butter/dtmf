import { describe, expect, test } from "bun:test";
import { createDtmfEngine } from "../../src/lib/dtmf/engine";
import { FakeAudioContext } from "../helpers/FakeAudioContext";

describe("Visualizer integration", () => {
  test("engine exposes analyser after ensureContext", async () => {
    const fake = new FakeAudioContext();
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    expect(engine.getAnalyser()).not.toBeNull();
  });
});
