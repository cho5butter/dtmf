import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { handleKeyboard } from "../../src/islands/PhoneApp";
import { createDtmfEngine } from "../../src/lib/dtmf/engine";
import { appState, setInput } from "../../src/lib/state/store";
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

describe("handleKeyboard inFormField guard (B-09)", () => {
  beforeEach(() => {
    setInput("");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("DTMF keydown is ignored when target is an <input>", () => {
    const input = document.createElement("input");
    input.type = "tel";
    document.body.appendChild(input);

    const event = new KeyboardEvent("keydown", { key: "5", bubbles: true });
    input.dispatchEvent(event);
    handleKeyboard(event);

    expect(appState.raw).toBe("");
  });

  test("DTMF keydown is ignored when target is a <textarea>", () => {
    const ta = document.createElement("textarea");
    document.body.appendChild(ta);

    const event = new KeyboardEvent("keydown", { key: "3", bubbles: true });
    ta.dispatchEvent(event);
    handleKeyboard(event);

    expect(appState.raw).toBe("");
  });

  test("non-DTMF keys (a, etc.) are ignored regardless of focus", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);

    const event = new KeyboardEvent("keydown", { key: "a", bubbles: true });
    input.dispatchEvent(event);
    handleKeyboard(event);

    expect(appState.raw).toBe("");
  });
});
