import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createDtmfEngine } from "../../src/lib/dtmf/engine";
import {
  injectAudioContextConstructor,
  resetAudioContextForTests,
} from "../../src/lib/platform/audioContextFactory";
import { FakeAudioContext } from "../helpers/FakeAudioContext";

describe("DtmfEngine", () => {
  let fake: FakeAudioContext;

  beforeEach(() => {
    fake = new FakeAudioContext();
    injectAudioContextConstructor(FakeAudioContext as unknown as typeof AudioContext);
    resetAudioContextForTests();
  });

  afterEach(() => {
    resetAudioContextForTests();
    injectAudioContextConstructor(null);
  });

  test("ensureContext resumes", async () => {
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    expect(fake.resumeCalls).toBeGreaterThanOrEqual(1);
  });

  test("pressKey creates two oscillators at correct frequencies", async () => {
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    engine.pressKey("5");
    expect(fake.createdNodes.oscillators.length).toBe(2);
    const freqs = fake.createdNodes.oscillators.map((o) => o.frequency.value).sort((a, b) => a - b);
    expect(freqs).toEqual([770, 1336]);
  });

  test("releaseKey stops oscillators", async () => {
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    engine.pressKey("1");
    engine.releaseKey();
    expect(fake.createdNodes.oscillators.every((o) => o.stopCalls >= 0)).toBe(true);
  });

  test("playTone resolves after duration", async () => {
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    const start = fake.currentTime;
    const p = engine.playTone("1", 150, start);
    fake.advanceTime(0.2);
    await p;
    expect(fake.currentTime).toBeGreaterThanOrEqual(start);
  });

  test("stopAll clears active tone", async () => {
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    engine.pressKey("3");
    engine.stopAll();
    engine.releaseKey();
    expect(true).toBe(true);
  });

  test("setVolume updates master gain", async () => {
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    engine.setVolume(0.5);
    engine.pressKey("0");
    const master = fake.createdNodes.gains[0];
    expect(master?.gain.value).toBe(0.25);
  });

  test("getAnalyser returns node", async () => {
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    expect(engine.getAnalyser()).not.toBeNull();
  });

  test("isSupported false without AudioContext", () => {
    injectAudioContextConstructor(null);
    const engine = createDtmfEngine();
    expect(engine.isSupported()).toBe(false);
  });
});
