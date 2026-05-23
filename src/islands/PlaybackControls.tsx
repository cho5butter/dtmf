/** @jsxImportSource solid-js */
import { createSignal, onCleanup } from "solid-js";
import { useServices } from "../lib/state/context";
import {
  appState,
  pushToast,
  resetPlayback,
  setCurrentDigitIdx,
  setPlayback,
} from "../lib/state/store";

export default function PlaybackControls() {
  const services = useServices();
  const { engine, sequencer } = services;
  const [abortController, setAbortController] = createSignal<AbortController | null>(null);

  const stop = () => {
    if (services.stopAll) {
      services.stopAll();
      return;
    }
    abortController()?.abort();
    engine.stopAll();
    resetPlayback();
  };

  const startAuto = async () => {
    if (services.runAutoPlay) {
      await services.runAutoPlay();
      return;
    }
    if (!appState.digits) {
      pushToast({ kind: "error", message: "再生できる番号がありません" });
      return;
    }
    abortController()?.abort();
    const ac = new AbortController();
    setAbortController(ac);
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
      resetPlayback();
    }
  };

  onCleanup(() => stop());

  const isRunning = () => appState.playback === "auto_running";
  const isPaused = () => appState.playback === "auto_paused";

  return (
    <nav class="transport transport-sticky" data-testid="playback-controls">
      <button
        type="button"
        class="t-btn t-btn--primary"
        onClick={() => void startAuto()}
        disabled={isRunning()}
        aria-label="番号をすべて再生"
      >
        <span class="t-btn__icon">▶</span>
        <span class="t-btn__label">PLAY</span>
        <kbd class="t-btn__kbd">↵</kbd>
      </button>
      <button
        type="button"
        class="t-btn"
        onClick={stop}
        data-testid="stop-button"
        aria-label="再生を停止"
      >
        <span class="t-btn__icon">■</span>
        <span class="t-btn__label">STOP</span>
        <kbd class="t-btn__kbd">esc</kbd>
      </button>
      <button
        type="button"
        class="t-btn"
        onClick={() => {
          if (isRunning()) {
            sequencer.pause();
            setPlayback("auto_paused");
          }
        }}
        disabled={!isRunning()}
        aria-label="一時停止"
      >
        <span class="t-btn__icon">⏸</span>
        <span class="t-btn__label">PAUSE</span>
      </button>
      <button
        type="button"
        class="t-btn"
        onClick={() => {
          if (isPaused()) {
            sequencer.resume();
            setPlayback("auto_running");
          }
        }}
        disabled={!isPaused()}
        aria-label="再開"
      >
        <span class="t-btn__icon">▷</span>
        <span class="t-btn__label">RESUME</span>
      </button>
      <button
        type="button"
        class="t-btn"
        onClick={() => {
          stop();
          void startAuto();
        }}
        data-testid="restart-button"
        aria-label="最初から再生"
      >
        <span class="t-btn__icon">↻</span>
        <span class="t-btn__label">RESTART</span>
      </button>
    </nav>
  );
}
