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
    <details class="panel" data-testid="detail-panel">
      <summary>DETAILS / Frequencies</summary>
      <div class="panel__body">
        <Show
          when={freqs()}
          fallback={
            <p style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-50); margin: 0;">
              再生中のキーがありません
            </p>
          }
        >
          {(f) => (
            <dl class="freq-grid">
              <dt>Low (Hz)</dt>
              <dd data-testid="low-freq">{f().low}</dd>
              <dt>High (Hz)</dt>
              <dd data-testid="high-freq">{f().high}</dd>
            </dl>
          )}
        </Show>
      </div>
    </details>
  );
}
