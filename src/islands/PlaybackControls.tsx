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
  const { engine, sequencer } = useServices();
  const [abortController, setAbortController] = createSignal<AbortController | null>(null);

  const stop = () => {
    abortController()?.abort();
    engine.stopAll();
    resetPlayback();
  };

  const startAuto = async () => {
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
      pushToast({ kind: "error", message: "再生に失敗しました。ページを再読み込みしてください" });
    } finally {
      resetPlayback();
    }
  };

  onCleanup(() => stop());

  const isRunning = () => appState.playback === "auto_running";
  const isPaused = () => appState.playback === "auto_paused";

  return (
    <div class="playback-bar" data-testid="playback-controls">
      <button
        type="button"
        class="btn btn--primary btn--play"
        onClick={() => void startAuto()}
        disabled={isRunning()}
        aria-label="番号をすべて再生"
      >
        再生
      </button>
      <button
        type="button"
        class="btn btn--secondary"
        onClick={stop}
        data-testid="stop-button"
        aria-label="再生を停止"
      >
        停止
      </button>
      <button
        type="button"
        class="btn btn--secondary"
        onClick={() => {
          if (isRunning()) {
            sequencer.pause();
            setPlayback("auto_paused");
          }
        }}
        disabled={!isRunning()}
      >
        一時停止
      </button>
      <button
        type="button"
        class="btn btn--secondary"
        onClick={() => {
          if (isPaused()) {
            sequencer.resume();
            setPlayback("auto_running");
          }
        }}
        disabled={!isPaused()}
      >
        再開
      </button>
      <button
        type="button"
        class="btn btn--secondary"
        onClick={() => {
          stop();
          void startAuto();
        }}
        data-testid="restart-button"
      >
        最初から
      </button>
    </div>
  );
}
