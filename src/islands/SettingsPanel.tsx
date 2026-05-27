/** @jsxImportSource solid-js */
import { createSignal, onMount } from "solid-js";
import { useServices } from "../lib/state/context";
import { appState, setSettings } from "../lib/state/store";

export default function SettingsPanel() {
  const { engine } = useServices();
  const [openByDefault, setOpenByDefault] = createSignal(false);

  onMount(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(min-width: 1024px)").matches) {
      setOpenByDefault(true);
    }
  });

  return (
    <details class="panel" data-testid="settings-panel" open={openByDefault() || undefined}>
      <summary>CONFIG</summary>
      <div class="panel__body">
        <label class="range-field">
          <span class="range-field__label">
            <span>Tone duration</span>
            <span class="range-field__value">{appState.settings.toneDurationMs} ms</span>
          </span>
          <input
            type="range"
            min="80"
            max="500"
            step="10"
            value={appState.settings.toneDurationMs}
            onInput={(e) => {
              const v = Number((e.currentTarget as HTMLInputElement).value);
              setSettings({ toneDurationMs: v });
            }}
            aria-label="トーン長"
            data-testid="tone-duration"
          />
        </label>
        <label class="range-field">
          <span class="range-field__label">
            <span>Gap between digits</span>
            <span class="range-field__value">{appState.settings.gapMs} ms</span>
          </span>
          <input
            type="range"
            min="30"
            max="500"
            step="10"
            value={appState.settings.gapMs}
            onInput={(e) => {
              const v = Number((e.currentTarget as HTMLInputElement).value);
              setSettings({ gapMs: v });
            }}
            aria-label="桁間ギャップ"
            data-testid="gap-ms"
          />
        </label>
        <label class="range-field">
          <span class="range-field__label">
            <span>Volume</span>
            <span class="range-field__value">{Math.round(appState.settings.volume * 100)}%</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={appState.settings.volume * 100}
            onInput={(e) => {
              const v = Number((e.currentTarget as HTMLInputElement).value) / 100;
              setSettings({ volume: v });
              engine.setVolume(v);
            }}
            aria-label="音量"
            data-testid="volume"
          />
        </label>
      </div>
    </details>
  );
}
