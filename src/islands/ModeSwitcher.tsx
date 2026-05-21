/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { runViewTransition } from "../lib/platform/viewTransition";
import { useServices } from "../lib/state/context";
import type { UiMode } from "../lib/state/persistence";
import { appState, setMode } from "../lib/state/store";

const MODES: { id: UiMode; label: string }[] = [
  { id: "retro", label: "レトロ" },
  { id: "modern", label: "モダン" },
  { id: "rotary", label: "回転" },
];

export default function ModeSwitcher() {
  const { engine } = useServices();

  const switchMode = (mode: UiMode) => {
    runViewTransition(() => {
      engine.stopAll();
      setMode(mode);
    });
  };

  return (
    <fieldset class="mb-4 flex gap-2 border-0 p-0" data-testid="mode-switcher">
      <legend class="sr-only">UIモード切替</legend>
      <For each={MODES}>
        {(m) => (
          <button
            type="button"
            class="flex-1 rounded-lg border px-3 py-2 text-sm font-medium"
            classList={{
              "border-cyan-500 bg-cyan-50 text-cyan-900": appState.mode === m.id,
              "border-neutral-300 bg-white text-neutral-700": appState.mode !== m.id,
            }}
            aria-pressed={appState.mode === m.id}
            onClick={() => switchMode(m.id)}
          >
            {m.label}
          </button>
        )}
      </For>
    </fieldset>
  );
}
