/** @jsxImportSource solid-js */
import { appState, setInput } from "../lib/state/store";

export default function NumberInput() {
  const handleInput = (e: Event) => {
    const value = (e.currentTarget as HTMLInputElement).value;
    setInput(value);
  };

  return (
    <div class="mb-4">
      <label class="mb-1 block text-sm font-medium" for="phone-input">
        電話番号
      </label>
      <input
        id="phone-input"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-lg tracking-wider"
        value={appState.raw}
        onInput={handleInput}
        aria-label="電話番号入力"
        aria-describedby="intl-prefix-note"
        data-testid="phone-input"
      />
      <p id="intl-prefix-note" class="mt-1 text-xs text-neutral-500">
        {appState.hadInternationalPrefix
          ? "先頭の + は表示のみで、DTMF では鳴らされません。"
          : "0-9、*、# のみ再生されます。"}
      </p>
      <div class="mt-2 font-mono text-sm" aria-live="polite">
        {appState.display.split("").map((char, idx) => (
          <span data-active={appState.currentDigitIdx === idx ? "true" : undefined}>{char}</span>
        ))}
      </div>
    </div>
  );
}
