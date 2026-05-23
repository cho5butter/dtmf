/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { DTMF_KEYS, type DtmfKey } from "../lib/dtmf/frequencyMap";
import { useServices } from "../lib/state/context";
import { appState } from "../lib/state/store";
import { usePadDialRelease } from "./useDialRelease";

const LABELS: Record<DtmfKey, string> = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  "*": "✱",
  "0": "0",
  "#": "#",
};

const CAPS: Record<DtmfKey, string> = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  "*": "*",
  "0": "0",
  "#": "#",
};

export default function DialPad() {
  const { engine } = useServices();
  const { onKeyDown, onKeyUp } = usePadDialRelease(engine);

  return (
    <div class="keypad" data-testid="dial-pad">
      <For each={DTMF_KEYS}>
        {(key) => (
          <button
            type="button"
            class="key"
            aria-label={`ダイヤルキー ${LABELS[key]}`}
            data-key={key}
            data-active={
              appState.currentDigitIdx >= 0 && appState.digits[appState.currentDigitIdx] === key
                ? "true"
                : undefined
            }
            onPointerDown={(e) => onKeyDown(key, e)}
            onPointerUp={(e) => void onKeyUp(key, e)}
            onPointerCancel={(e) => void onKeyUp(key, e)}
          >
            <span class="key__label">{LABELS[key]}</span>
            <span class="key__cap" aria-hidden="true">
              {CAPS[key]}
            </span>
          </button>
        )}
      </For>
    </div>
  );
}
