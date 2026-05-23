import type { DtmfEngine } from "./engine";
import type { DtmfKey } from "./frequencyMap";
import { isDtmfKey } from "./frequencyMap";

export interface DialBuffer {
  start(): void;
  push(digit: string): void;
  joined(): string;
  drain(): string;
  isEmpty(): boolean;
}

export function createDialBuffer(): DialBuffer {
  let digits: string[] = [];

  return {
    start() {
      digits = [];
    },
    push(digit: string) {
      if (isDtmfKey(digit)) digits.push(digit);
    },
    joined() {
      return digits.join("");
    },
    drain() {
      const s = digits.join("");
      digits = [];
      return s;
    },
    isEmpty() {
      return digits.length === 0;
    },
  };
}

export interface PlaySequenceOptions {
  toneDurationMs: number;
  gapMs: number;
}

/** ためた桁を順に再生（解放時） */
export async function playDigitSequence(
  engine: DtmfEngine,
  digits: string,
  opts: PlaySequenceOptions,
): Promise<void> {
  if (!digits) return;
  await engine.ensureContext();
  for (let i = 0; i < digits.length; i++) {
    const ch = digits[i];
    if (!ch || !isDtmfKey(ch)) continue;
    await engine.playTone(ch as DtmfKey, opts.toneDurationMs);
    if (i < digits.length - 1) {
      await new Promise((r) => setTimeout(r, opts.gapMs));
    }
  }
}
