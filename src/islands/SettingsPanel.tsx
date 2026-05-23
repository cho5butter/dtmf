/** @jsxImportSource solid-js */
import { useServices } from "../lib/state/context";
import { appState, setSettings } from "../lib/state/store";

export default function SettingsPanel() {
  const { engine } = useServices();

  return (
    <details class="glass-panel" data-testid="settings-panel">
      <summary>設定</summary>
      <div class="mt-4 space-y-4">
        <label class="block text-sm text-zinc-300">
          トーン長 (ms): {appState.settings.toneDurationMs}
          <input
            type="range"
            min="80"
            max="500"
            step="10"
            class="mt-2 w-full accent-blue-500"
            value={appState.settings.toneDurationMs}
            onInput={(e) => {
              const v = Number((e.currentTarget as HTMLInputElement).value);
              setSettings({ toneDurationMs: v });
            }}
            aria-label="トーン長"
            data-testid="tone-duration"
          />
        </label>
        <label class="block text-sm text-zinc-300">
          桁間ギャップ (ms): {appState.settings.gapMs}
          <input
            type="range"
            min="30"
            max="500"
            step="10"
            class="mt-2 w-full accent-blue-500"
            value={appState.settings.gapMs}
            onInput={(e) => {
              const v = Number((e.currentTarget as HTMLInputElement).value);
              setSettings({ gapMs: v });
            }}
            aria-label="桁間ギャップ"
            data-testid="gap-ms"
          />
        </label>
        <label class="block text-sm text-zinc-300">
          音量: {Math.round(appState.settings.volume * 100)}%
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            class="mt-2 w-full accent-blue-500"
            value={appState.settings.volume * 100}
            onInput={(e) => {
              const v = Number((e.currentTarget as HTMLInputElement).value) / 100;
              setSettings({ volume: v });
              engine.setVolume(v * v);
            }}
            aria-label="音量"
            data-testid="volume"
          />
        </label>
      </div>
    </details>
  );
}
