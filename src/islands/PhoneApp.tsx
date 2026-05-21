/** @jsxImportSource solid-js */
import { onMount, Show } from "solid-js";
import { createDtmfEngine } from "../lib/dtmf/engine";
import { isDtmfKey } from "../lib/dtmf/frequencyMap";
import { createAutoDialSequencer } from "../lib/dtmf/sequencer";
import { ServicesProvider } from "../lib/state/context";
import {
  appState,
  resetPlayback,
  setAudioSupported,
  setContextSuspended,
  setPlayback,
} from "../lib/state/store";
import DialPad from "./DialPad";
import ModernPad from "./ModernPad";
import ModeSwitcher from "./ModeSwitcher";
import NumberInput from "./NumberInput";
import RotaryDial from "./RotaryDial";
import Toast from "./Toast";

const engine = createDtmfEngine();
const sequencer = createAutoDialSequencer(engine);

function handleKeyboard(e: KeyboardEvent) {
  const key = e.key;
  if (key === "Escape") {
    engine.stopAll();
    resetPlayback();
    return;
  }
  if (isDtmfKey(key)) {
    e.preventDefault();
    void engine.ensureContext();
    engine.pressKey(key);
    setPlayback("key_held");
    const onUp = () => {
      engine.releaseKey();
      setPlayback("idle");
      window.removeEventListener("keyup", onUp);
    };
    window.addEventListener("keyup", onUp);
  }
}

export default function PhoneApp() {
  onMount(() => {
    const supported = engine.isSupported();
    setAudioSupported(supported);
    if (!supported) {
      document.getElementById("audio-unsupported")?.classList.remove("hidden");
    }
    engine.setVolume(appState.settings.volume);
    document.addEventListener("keydown", handleKeyboard);
    return () => {
      document.removeEventListener("keydown", handleKeyboard);
      engine.stopAll();
    };
  });

  const onFirstInteraction = () => {
    void engine
      .ensureContext()
      .then(() => setContextSuspended(false))
      .catch(() => setContextSuspended(true));
  };

  return (
    <ServicesProvider value={{ engine, sequencer }}>
      <div
        class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
        onPointerDown={onFirstInteraction}
        data-testid="phone-app"
      >
        <Show when={appState.audio.contextSuspended}>
          <p class="mb-4 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900" role="status">
            画面をタップして音を有効にしてください
          </p>
        </Show>
        <Show when={!appState.audio.supported}>
          <p class="mb-4 text-sm text-red-700" role="alert">
            Web Audio API に対応していません
          </p>
        </Show>
        <NumberInput />
        <ModeSwitcher />
        <Show when={appState.mode === "retro"}>
          <div class="retro-panel">
            <DialPad />
          </div>
        </Show>
        <Show when={appState.mode === "modern"}>
          <div class="modern-panel">
            <ModernPad />
          </div>
        </Show>
        <Show when={appState.mode === "rotary"}>
          <div class="rotary-panel">
            <RotaryDial />
          </div>
        </Show>
      </div>
      <Toast />
    </ServicesProvider>
  );
}
