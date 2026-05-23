/** @jsxImportSource solid-js */
import { For } from "solid-js";
import type { UiMode } from "../lib/state/persistence";
import { appState, setMode } from "../lib/state/store";

const MODES: { id: UiMode; label: string; code: string }[] = [
  { id: "retro", label: "レトロ", code: "01" },
  { id: "modern", label: "モダン", code: "02" },
  { id: "rotary", label: "回転", code: "03" },
];

function ModeButton(props: { id: UiMode; label: string; code: string }) {
  const isActive = () => appState.mode === props.id;
  return (
    <button
      type="button"
      class="mode-pick__btn"
      aria-pressed={isActive() ? "true" : "false"}
      aria-label={props.label}
      onClick={() => setMode(props.id)}
    >
      <span aria-hidden="true" style="opacity: 0.5; margin-right: 6px; font-weight: 500;">
        {props.code}
      </span>
      <span aria-hidden="true">{props.label}</span>
    </button>
  );
}

export default function ModeSwitcher() {
  return (
    <fieldset
      class="mode-pick"
      data-testid="mode-switcher"
      style="border-width: 2px; padding: 0; margin: 0;"
    >
      <legend class="sr-only">UIモード切替</legend>
      <For each={MODES}>{(m) => <ModeButton id={m.id} label={m.label} code={m.code} />}</For>
    </fieldset>
  );
}
