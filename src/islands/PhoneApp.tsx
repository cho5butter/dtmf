/** @jsxImportSource solid-js */
import { onMount, Show } from "solid-js";
import { playDigitSequence } from "../lib/dtmf/dialBuffer";
import { createDtmfEngine } from "../lib/dtmf/engine";
import { isDtmfKey } from "../lib/dtmf/frequencyMap";
import { createAutoDialSequencer } from "../lib/dtmf/sequencer";
import { ServicesProvider } from "../lib/state/context";
import { recordDialKey } from "../lib/state/dialActions";
import {
  appState,
  pushToast,
  resetPlayback,
  setAudioSupported,
  setContextSuspended,
  setCurrentDigitIdx,
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
let autoController: AbortController | null = null;

async function runAutoPlay() {
  if (!appState.digits) {
    pushToast({ kind: "error", message: "再生できる番号がありません" });
    return;
  }
  autoController?.abort();
  const ac = new AbortController();
  autoController = ac;
  setPlayback("auto_running");
  setCurrentDigitIdx(-1);
  try {
    await engine.ensureContext();
    await sequencer.start(appState.digits, {
      toneDurationMs: appState.settings.toneDurationMs,
      gapMs: appState.settings.gapMs,
      signal: ac.signal,
      onTick: (idx) => setCurrentDigitIdx(idx),
    });
  } catch {
    pushToast({ kind: "error", message: "再生に失敗しました" });
  } finally {
    if (autoController === ac) autoController = null;
    resetPlayback();
  }
}

function stopAll() {
  autoController?.abort();
  autoController = null;
  engine.stopAll();
  resetPlayback();
  heldKeys.clear();
}

function handleKeyboard(e: KeyboardEvent) {
  const key = e.key;
  const target = e.target as HTMLElement | null;
  const inFormField = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

  if (key === "Escape") {
    stopAll();
    return;
  }

  if (key === "Enter" && e.type === "keydown" && !e.repeat) {
    if (inFormField && target && (target as HTMLInputElement).type === "tel") {
      e.preventDefault();
      void runAutoPlay();
      return;
    }
    if (!inFormField) {
      e.preventDefault();
      void runAutoPlay();
      return;
    }
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
      const banner = document.getElementById("audio-unsupported");
      if (banner) banner.style.display = "block";
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

  return (
    <ServicesProvider value={{ engine, sequencer, runAutoPlay, stopAll }}>
      <div class="phone-app" data-testid="phone-app">
        <Show when={appState.audio.contextSuspended}>
          <div class="audio-banner" role="status">
            <p class="audio-banner__title">▶ 音を有効にしてください</p>
            <p class="audio-banner__hint">スマホでは最初に 1 タップが必要です</p>
            <button type="button" class="t-btn" onClick={activateAudio}>
              <span class="t-btn__icon">▸</span>
              <span class="t-btn__label">有効にする</span>
            </button>
          </div>
        </Show>
        <Show when={!appState.audio.supported}>
          <p class="audio-error" role="alert">
            Web Audio API に対応していません
          </p>
        </Show>

        <div class="col-left">
          <NumberInput />
          <PlaybackControls />
          <Visualizer />
          <SettingsPanel />
          <DetailPanel />
        </div>

        <div class="col-right">
          <ModeSwitcher />
          <section class="dial-stage" aria-label="ダイヤル入力">
            {appState.mode === "retro" && <DialPad />}
            {appState.mode === "modern" && <ModernPad />}
            {appState.mode === "rotary" && <RotaryDial />}
          </section>
        </div>
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
