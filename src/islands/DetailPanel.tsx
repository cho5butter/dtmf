/** @jsxImportSource solid-js */
import { Show } from "solid-js";
import { DTMF_FREQUENCY_MAP } from "../lib/dtmf/frequencyMap";
import { appState } from "../lib/state/store";

export default function DetailPanel() {
  const currentChar = () =>
    appState.currentDigitIdx >= 0 ? appState.digits[appState.currentDigitIdx] : null;

  const freqs = () => {
    const c = currentChar();
    if (!c || !(c in DTMF_FREQUENCY_MAP)) return null;
    return DTMF_FREQUENCY_MAP[c as keyof typeof DTMF_FREQUENCY_MAP];
  };

  return (
    <details
      class="mt-4 rounded-lg border border-neutral-200 bg-white p-4"
      data-testid="detail-panel"
    >
      <summary class="cursor-pointer font-medium">周波数詳細</summary>
      <Show
        when={freqs()}
        fallback={<p class="mt-2 text-sm text-neutral-500">再生中のキーがありません</p>}
      >
        {(f) => (
          <dl class="mt-2 grid grid-cols-2 gap-2 text-sm">
            <dt>低群 (Hz)</dt>
            <dd data-testid="low-freq">{f().low}</dd>
            <dt>高群 (Hz)</dt>
            <dd data-testid="high-freq">{f().high}</dd>
          </dl>
        )}
      </Show>
    </details>
  );
}
