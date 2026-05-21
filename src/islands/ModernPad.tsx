/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { DTMF_KEYS, type DtmfKey } from "../lib/dtmf/frequencyMap";
import { useServices } from "../lib/state/context";
import { appState } from "../lib/state/store";

export default function ModernPad() {
  const { engine } = useServices();

  const press = (key: DtmfKey) => {
    void engine.ensureContext().catch(() => {});
    engine.pressKey(key);
  };

  const release = () => engine.releaseKey();

  return (
    <div class="grid grid-cols-3 gap-3" data-testid="modern-pad">
      <For each={DTMF_KEYS}>
        {(key) => (
          <button
            type="button"
            class="dtmf-key rounded-2xl bg-neutral-800 text-lg font-medium text-cyan-300 hover:bg-neutral-700"
            aria-label={`ダイヤルキー ${key}`}
            data-key={key}
            data-active={
              appState.currentDigitIdx >= 0 && appState.digits[appState.currentDigitIdx] === key
                ? "true"
                : undefined
            }
            onPointerDown={(e) => {
              e.preventDefault();
              press(key);
            }}
            onPointerUp={release}
            onPointerLeave={release}
            onPointerCancel={release}
          >
            {key}
          </button>
        )}
      </For>
    </div>
  );
}
