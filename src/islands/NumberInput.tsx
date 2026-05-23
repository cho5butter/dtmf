/** @jsxImportSource solid-js */
import { appState, setInput } from "../lib/state/store";

export default function NumberInput() {
  const handleInput = (e: Event) => {
    const value = (e.currentTarget as HTMLInputElement).value;
    setInput(value);
  };

  return (
    <div class="mb-4">
      <label
        class="mb-2 block text-xs font-medium tracking-wide text-zinc-400 uppercase"
        for="phone-input"
      >
        電話番号
      </label>
      <input
        id="phone-input"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        class="display-field"
        placeholder="番号を入力"
        value={appState.raw}
        onInput={handleInput}
        aria-label="電話番号入力"
        aria-describedby="intl-prefix-note"
        data-testid="phone-input"
      />
      <p id="intl-prefix-note" class="hint-text mt-2">
        {appState.hadInternationalPrefix
          ? "先頭の + は表示のみで、DTMF では鳴らされません。"
          : "0-9、*、# のみ。キーは押下でため、離すと再生します。"}
      </p>
      <div class="digit-preview mt-3 min-h-[1.25rem] text-base" aria-live="polite">
        {appState.display.split("").map((char, idx) => (
          <span data-active={appState.currentDigitIdx === idx ? "true" : undefined}>{char}</span>
        ))}
      </div>
    </div>
  );
}
