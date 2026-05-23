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
  "*": "＊",
  "0": "0",
  "#": "＃",
};

export default function DialPad() {
  const { engine } = useServices();
  const { onKeyDown, onKeyUp } = usePadDialRelease(engine);

  return (
    <div class="grid grid-cols-3 gap-3" data-testid="dial-pad">
      <p class="hint-text col-span-3 mb-1">押して数字をため、離すとトーンが鳴ります</p>
      <For each={DTMF_KEYS}>
        {(key) => (
          <button
            type="button"
            class="dtmf-key"
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
            {LABELS[key]}
          </button>
        )}
      </For>
    </div>
  );
}
