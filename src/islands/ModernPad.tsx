/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { DTMF_KEYS, type DtmfKey } from "../lib/dtmf/frequencyMap";
import { useServices } from "../lib/state/context";
import { appState } from "../lib/state/store";
import { usePadDialRelease } from "./useDialRelease";

export default function ModernPad() {
  const { engine } = useServices();
  const { onKeyDown, onKeyUp } = usePadDialRelease(engine);

  return (
    <div class="grid grid-cols-3 gap-3" data-testid="modern-pad">
      <p class="hint-text col-span-3 mb-1">押して数字をため、離すとトーンが鳴ります</p>
      <For each={DTMF_KEYS}>
        {(key) => (
          <button
            type="button"
            class="dtmf-key"
            aria-label={`ダイヤルキー ${key}`}
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
            {key}
          </button>
        )}
      </For>
    </div>
  );
}
