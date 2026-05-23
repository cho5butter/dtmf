import { describe, expect, test } from "bun:test";
import { createDialBuffer, playDigitSequence } from "../../src/lib/dtmf/dialBuffer";
import { createDtmfEngine } from "../../src/lib/dtmf/engine";
import { FakeAudioContext } from "../helpers/FakeAudioContext";

describe("createDialBuffer", () => {
  test("starts empty and accumulates digits", () => {
    const buf = createDialBuffer();
    buf.start();
    buf.push("5");
    buf.push("3");
    expect(buf.joined()).toBe("53");
    expect(buf.drain()).toBe("53");
    expect(buf.isEmpty()).toBe(true);
  });

  test("drain clears buffer", () => {
    const buf = createDialBuffer();
    buf.push("1");
    buf.drain();
    expect(buf.isEmpty()).toBe(true);
  });
});

describe("playDigitSequence", () => {
  test("plays each digit with playTone", async () => {
    const fake = new FakeAudioContext();
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    const played: string[] = [];
    const orig = engine.playTone.bind(engine);
    engine.playTone = async (key, ms, when) => {
      played.push(key);
      return orig(key, ms, when);
    };
    await playDigitSequence(engine, "12", { toneDurationMs: 100, gapMs: 50 });
    expect(played).toEqual(["1", "2"]);
  });
});
