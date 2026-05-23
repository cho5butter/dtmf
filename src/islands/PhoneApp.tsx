/** @jsxImportSource solid-js */
import { onMount, Show } from "solid-js";
import { playDigitSequence } from "../lib/dtmf/dialBuffer";
import { createDtmfEngine } from "../lib/dtmf/engine";
import { type DtmfKey, isDtmfKey } from "../lib/dtmf/frequencyMap";
import { createAutoDialSequencer } from "../lib/dtmf/sequencer";
import { ServicesProvider } from "../lib/state/context";
import { recordDialKey } from "../lib/state/dialActions";
import {
  appState,
  resetPlayback,
  setAudioSupported,
  setContextSuspended,
  setPlayback,
} from "../lib/state/store";
import DetailPanel from "./DetailPanel";
import DialPad from "./DialPad";
import ModernPad from "./ModernPad";
import ModeSwitcher from "./ModeSwitcher";
import NumberInput from "./NumberInput";
import PlaybackControls from "./PlaybackControls";
import RotaryDial from "./RotaryDial";
import SettingsPanel from "./SettingsPanel";
import Toast from "./Toast";
import Visualizer from "./Visualizer";

const engine = createDtmfEngine();
const sequencer = createAutoDialSequencer(engine);

const heldKeys = new Set<string>();

function handleKeyboard(e: KeyboardEvent) {
  const key = e.key;
  if (key === "Escape") {
    engine.stopAll();
    resetPlayback();
    heldKeys.clear();
    return;
  }
  if (!isDtmfKey(key)) return;

  if (e.type === "keydown" && !e.repeat) {
    e.preventDefault();
    heldKeys.add(key);
    void engine.ensureContext();
    recordDialKey(key);
    setPlayback("key_held");
    return;
  }

  if (e.type === "keyup" && heldKeys.has(key)) {
    e.preventDefault();
    heldKeys.delete(key);
    void playDigitSequence(engine, key, {
      toneDurationMs: appState.settings.toneDurationMs,
      gapMs: appState.settings.gapMs,
    }).finally(() => {
      if (heldKeys.size === 0) setPlayback("idle");
    });
  }
}

export default function PhoneApp() {
  onMount(() => {
    const supported = engine.isSupported();
    setAudioSupported(supported);
    if (!supported) {
      document.getElementById("audio-unsupported")?.classList.remove("hidden");
    }
    engine.setVolume(appState.settings.volume ** 2);
    document.addEventListener("keydown", handleKeyboard);
    document.addEventListener("keyup", handleKeyboard);
    return () => {
      document.removeEventListener("keydown", handleKeyboard);
      document.removeEventListener("keyup", handleKeyboard);
      engine.stopAll();
    };
  });

  const activateAudio = () => {
    void engine
      .ensureContext()
      .then(() => setContextSuspended(false))
      .catch(() => setContextSuspended(true));
  };

  const themeClass = () => {
    const m = appState.mode;
    if (m === "retro") return "theme-retro";
    if (m === "modern") return "theme-modern";
    return "theme-rotary";
  };

  return (
    <ServicesProvider value={{ engine, sequencer }}>
      <div class={`dialer ${themeClass()}`} data-testid="phone-app">
        <Show when={appState.audio.contextSuspended}>
          <div class="audio-banner" role="status">
            <p class="audio-banner__title">音を有効にしてください</p>
            <p class="audio-banner__hint">スマホでは最初のタップが必要です</p>
            <button type="button" class="btn btn--primary" onClick={activateAudio}>
              有効にする
            </button>
          </div>
        </Show>
        <Show when={!appState.audio.supported}>
          <p class="audio-error" role="alert">
            Web Audio API に対応していません
          </p>
        </Show>

        <ModeSwitcher />

        <section class="dial-section" aria-label="ダイヤル入力">
          {appState.mode === "retro" && <DialPad />}
          {appState.mode === "modern" && <ModernPad />}
          {appState.mode === "rotary" && <RotaryDial />}
        </section>

        <NumberInput />
        <PlaybackControls />
        <Visualizer />
        <SettingsPanel />
        <DetailPanel />
      </div>
      <Toast />
      <div class="sr-only" aria-live="polite" id="playback-announcer">
        {appState.playback === "auto_running" && appState.currentDigitIdx >= 0
          ? `再生中: ${appState.digits[appState.currentDigitIdx]}`
          : ""}
      </div>
    </ServicesProvider>
  );
}
