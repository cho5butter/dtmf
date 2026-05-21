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
      pushToast({ kind: "error", message: "ダイヤル可能な文字がありません" });
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
      pushToast({ kind: "error", message: "音声合成に失敗しました。再読込してください" });
    } finally {
      resetPlayback();
    }
  };

  onCleanup(() => stop());

  return (
    <div class="mt-4 flex flex-wrap gap-2" data-testid="playback-controls">
      <button
        type="button"
        class="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
        onClick={() => void startAuto()}
        disabled={appState.playback === "auto_running"}
      >
        自動ダイヤル
      </button>
      <button
        type="button"
        class="rounded-lg border border-neutral-300 px-4 py-2 text-sm"
        onClick={stop}
        data-testid="stop-button"
      >
        停止
      </button>
      <button
        type="button"
        class="rounded-lg border border-neutral-300 px-4 py-2 text-sm"
        onClick={() => {
          if (appState.playback === "auto_running") {
            sequencer.pause();
            setPlayback("auto_paused");
          }
        }}
        disabled={appState.playback !== "auto_running"}
      >
        一時停止
      </button>
      <button
        type="button"
        class="rounded-lg border border-neutral-300 px-4 py-2 text-sm"
        onClick={() => {
          if (appState.playback === "auto_paused") {
            sequencer.resume();
            setPlayback("auto_running");
          }
        }}
        disabled={appState.playback !== "auto_paused"}
      >
        再開
      </button>
      <button
        type="button"
        class="rounded-lg border border-neutral-300 px-4 py-2 text-sm"
        onClick={() => {
          stop();
          void startAuto();
        }}
        data-testid="restart-button"
      >
        やり直し
      </button>
    </div>
  );
}
