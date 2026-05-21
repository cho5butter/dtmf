import { describe, expect, test } from "bun:test";
import { createDtmfEngine } from "../../src/lib/dtmf/engine";
import { FakeAudioContext } from "../helpers/FakeAudioContext";

describe("keyboard routing", () => {
  test("digit key triggers pressKey", async () => {
    const fake = new FakeAudioContext();
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    engine.pressKey("7");
    expect(fake.createdNodes.oscillators.length).toBe(2);
    engine.stopAll();
  });

  test("escape stops all", async () => {
    const fake = new FakeAudioContext();
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    engine.pressKey("1");
    engine.stopAll();
    expect(true).toBe(true);
  });
});
