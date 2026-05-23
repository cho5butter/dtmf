import { createDialBuffer, playDigitSequence } from "../lib/dtmf/dialBuffer";
import type { DtmfEngine } from "../lib/dtmf/engine";
import type { DtmfKey } from "../lib/dtmf/frequencyMap";
import { recordDialKey } from "../lib/state/dialActions";
import { appState } from "../lib/state/store";

const rotaryBuffer = createDialBuffer();

export function usePadDialRelease(engine: DtmfEngine) {
  const onKeyDown = (key: DtmfKey, e: PointerEvent) => {
    e.preventDefault();
    void engine.ensureContext().catch(() => {});
    recordDialKey(key);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onKeyUp = async (key: DtmfKey, e: PointerEvent) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    await playDigitSequence(engine, key, {
      toneDurationMs: appState.settings.toneDurationMs,
      gapMs: appState.settings.gapMs,
    });
  };

  return { onKeyDown, onKeyUp };
}

export function useRotaryDialRelease(engine: DtmfEngine) {
  const startSession = () => {
    rotaryBuffer.start();
  };

  const recordDigit = (digit: string) => {
    rotaryBuffer.push(digit);
    if (digit.length === 1 && /^[0-9*#]$/.test(digit)) {
      recordDialKey(digit as DtmfKey);
    }
  };

  const releaseSession = async () => {
    const pending = rotaryBuffer.drain();
    if (!pending) return;
    await playDigitSequence(engine, pending, {
      toneDurationMs: appState.settings.toneDurationMs,
      gapMs: appState.settings.gapMs,
    });
  };

  return { startSession, recordDigit, releaseSession };
}
