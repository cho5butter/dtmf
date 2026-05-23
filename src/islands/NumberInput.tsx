/** @jsxImportSource solid-js */
import { For, Show } from "solid-js";
import { appState, setInput } from "../lib/state/store";

const MAX_DIGITS = 64;
const PLACEHOLDER = "— — — — —";

function statusOf(playback: string): { label: string; state: "input" | "playing" | "done" } {
  if (playback === "auto_running" || playback === "key_held") {
    return { label: "PLAYING", state: "playing" };
  }
  if (playback === "auto_paused") {
    return { label: "PAUSED", state: "playing" };
  }
  return { label: "INPUT", state: "input" };
}

export default function NumberInput() {
  const handleInput = (e: Event) => {
    const value = (e.currentTarget as HTMLInputElement).value;
    setInput(value);
  };

  const status = () => statusOf(appState.playback);

  const focusInput = () => {
    const el = document.querySelector('[data-testid="phone-input"]') as HTMLInputElement | null;
    el?.focus();
  };

  const digits = () => appState.display.split("");

  const digitState = (idx: number, totalRunning: boolean): "done" | "now" | "next" => {
    if (!totalRunning) return "done";
    if (appState.currentDigitIdx < 0) return "next";
    if (idx < appState.currentDigitIdx) return "done";
    if (idx === appState.currentDigitIdx) return "now";
    return "next";
  };

  return (
    <section class="display" aria-label="番号ディスプレイ" data-testid="number-field">
      <header class="display__meta">
        <span class="display__status" data-state={status().state}>
          ● {status().label}
        </span>
        <span class="display__count">
          {appState.digits.length} / {MAX_DIGITS}
        </span>
      </header>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 隠し input にフォーカス転送するだけ */}
      <output
        class="display__screen"
        aria-label="入力番号"
        data-testid="digit-preview"
        onClick={focusInput}
      >
        <Show
          when={appState.display.length > 0}
          fallback={<span class="display__placeholder">{PLACEHOLDER}</span>}
        >
          <For each={digits()}>
            {(char, idx) => {
              const running = () =>
                appState.playback === "auto_running" || appState.playback === "auto_paused";
              return (
                <span
                  class="display__digit"
                  data-state={digitState(idx(), running())}
                  data-active={appState.currentDigitIdx === idx() && running() ? "true" : undefined}
                >
                  {char}
                </span>
              );
            }}
          </For>
        </Show>
      </output>
      <input
        id="phone-input"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        class="display__hidden-input"
        value={appState.raw}
        onInput={handleInput}
        aria-label="電話番号入力"
        aria-describedby="display-hint"
        data-testid="phone-input"
      />
      <p id="display-hint" class="display__hint">
        {appState.hadInternationalPrefix
          ? "先頭の + は表示のみ"
          : "キーを押してためる / 離すと鳴る / Enter で全再生"}
      </p>
    </section>
  );
}
