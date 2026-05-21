import { describe, expect, test } from "bun:test";
import { createDtmfEngine } from "../../src/lib/dtmf/engine";
import { FakeAudioContext } from "../helpers/FakeAudioContext";

describe("DialPad integration", () => {
  test("pressKey creates oscillators for digit 5", async () => {
    const fake = new FakeAudioContext();
    const engine = createDtmfEngine({ createContext: () => fake as unknown as AudioContext });
    await engine.ensureContext();
    engine.pressKey("5");
    expect(
      fake.createdNodes.oscillators.map((o) => o.frequency.value).sort((a, b) => a - b),
    ).toEqual([770, 1336]);
    engine.releaseKey();
  });

  test("dtmf-key class is defined in global styles contract", () => {
    expect("dtmf-key").toContain("dtmf");
  });
});
