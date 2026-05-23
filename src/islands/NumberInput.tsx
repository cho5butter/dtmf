/** @jsxImportSource solid-js */
import { appState, setInput } from "../lib/state/store";

export default function NumberInput() {
  const handleInput = (e: Event) => {
    const value = (e.currentTarget as HTMLInputElement).value;
    setInput(value);
  };

  const hint = () =>
    appState.hadInternationalPrefix
      ? "先頭の + は表示のみ（DTMF では鳴りません）"
      : "0〜9、*、#。キーを押して番号をため、離すとそのキーの音が鳴ります";

  return (
    <div class="number-field" data-testid="number-field">
      <label class="number-field__label" for="phone-input">
        入力番号
      </label>
      <input
        id="phone-input"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        class="number-field__input"
        placeholder="番号がここに表示されます"
        value={appState.raw}
        onInput={handleInput}
        aria-label="電話番号入力"
        aria-describedby="intl-prefix-note"
        data-testid="phone-input"
      />
      <p id="intl-prefix-note" class="number-field__hint">
        {hint()}
      </p>
      <div
        class="number-field__preview"
        role="status"
        aria-label="再生中の桁"
        data-testid="digit-preview"
      >
        {appState.display.length === 0 ? (
          <span class="number-field__preview-empty">—</span>
        ) : (
          appState.display.split("").map((char, idx) => (
            <span
              class="number-field__digit"
              data-active={appState.currentDigitIdx === idx ? "true" : undefined}
            >
              {char}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
