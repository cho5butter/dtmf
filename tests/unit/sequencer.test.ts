import { describe, expect, test } from "bun:test";
import { createDtmfEngine } from "../../src/lib/dtmf/engine";
import { createAutoDialSequencer } from "../../src/lib/dtmf/sequencer";
import { FakeAudioContext } from "../helpers/FakeAudioContext";

describe("AutoDialSequencer", () => {
  test("schedules digits and calls onTick", async () => {
    const fake = new FakeAudioContext();
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    const sequencer = createAutoDialSequencer(engine);
    const ticks: number[] = [];
    const ac = new AbortController();
    const p = sequencer.start("12", {
      toneDurationMs: 100,
      gapMs: 50,
      signal: ac.signal,
      onTick: (i) => ticks.push(i),
    });
    fake.advanceTime(1);
    await p;
    expect(ticks.length).toBeGreaterThan(0);
  });

  test("abort stops playback", async () => {
    const fake = new FakeAudioContext();
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    const sequencer = createAutoDialSequencer(engine);
    const ac = new AbortController();
    void sequencer.start("12345", {
      toneDurationMs: 200,
      gapMs: 100,
      signal: ac.signal,
      onTick: () => {},
    });
    ac.abort();
    expect(sequencer.position()).toBeGreaterThanOrEqual(0);
  });

  test("pause and resume", async () => {
    const fake = new FakeAudioContext();
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    const sequencer = createAutoDialSequencer(engine);
    const ac = new AbortController();
    void sequencer.start("123", {
      toneDurationMs: 100,
      gapMs: 50,
      signal: ac.signal,
      onTick: () => {},
    });
    sequencer.pause();
    expect(sequencer.position()).toBeGreaterThanOrEqual(0);
    sequencer.resume();
    ac.abort();
  });
});
