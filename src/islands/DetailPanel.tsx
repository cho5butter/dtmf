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
    <details class="glass-panel" data-testid="detail-panel">
      <summary>周波数詳細</summary>
      <Show when={freqs()} fallback={<p class="hint-text mt-2">再生中のキーがありません</p>}>
        {(f) => (
          <dl class="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-300">
            <dt class="text-zinc-400">低群 (Hz)</dt>
            <dd data-testid="low-freq">{f().low}</dd>
            <dt class="text-zinc-400">高群 (Hz)</dt>
            <dd data-testid="high-freq">{f().high}</dd>
          </dl>
        )}
      </Show>
    </details>
  );
}
