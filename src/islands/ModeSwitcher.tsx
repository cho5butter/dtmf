/** @jsxImportSource solid-js */
import { For } from "solid-js";
import type { UiMode } from "../lib/state/persistence";
import { appState, setMode } from "../lib/state/store";

const MODES: { id: UiMode; label: string }[] = [
  { id: "retro", label: "レトロ" },
  { id: "modern", label: "モダン" },
  { id: "rotary", label: "回転" },
];

function ModeButton(props: { id: UiMode; label: string }) {
  const isActive = () => appState.mode === props.id;
  return (
    <button
      type="button"
      aria-pressed={isActive() ? "true" : "false"}
      onClick={() => setMode(props.id)}
    >
      {props.label}
    </button>
  );
}

export default function ModeSwitcher() {
  return (
    <fieldset class="mode-segment border-0 p-0" data-testid="mode-switcher">
      <legend class="sr-only">UIモード切替</legend>
      <For each={MODES}>{(m) => <ModeButton id={m.id} label={m.label} />}</For>
    </fieldset>
  );
}
