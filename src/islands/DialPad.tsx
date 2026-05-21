/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { DTMF_KEYS, type DtmfKey } from "../lib/dtmf/frequencyMap";
import { useServices } from "../lib/state/context";
import { appState } from "../lib/state/store";

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

  const press = (key: DtmfKey) => {
    void engine.ensureContext().catch(() => {});
    engine.pressKey(key);
  };

  const release = () => engine.releaseKey();

  return (
    <div class="grid grid-cols-3 gap-2" data-testid="dial-pad">
      <For each={DTMF_KEYS}>
        {(key) => (
          <button
            type="button"
            class="dtmf-key rounded-xl bg-emerald-800 text-lg font-semibold text-emerald-50 hover:bg-emerald-700"
            aria-label={`ダイヤルキー ${LABELS[key]}`}
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
            {LABELS[key]}
          </button>
        )}
      </For>
    </div>
  );
}
