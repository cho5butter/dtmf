import type { DtmfEngine } from "./engine";
import { digitToKey } from "./engine";

export interface AutoDialOptions {
  toneDurationMs: number;
  gapMs: number;
  signal: AbortSignal;
  onTick: (digitIdx: number) => void;
}

export interface AutoDialSequencer {
  start(digits: string, opts: AutoDialOptions): Promise<void>;
  pause(): void;
  resume(): void;
  position(): number;
}

const BATCH_SIZE = 16;

export function createAutoDialSequencer(engine: DtmfEngine): AutoDialSequencer {
  let digits = "";
  let opts: AutoDialOptions | null = null;
  let position = 0;
  let paused = false;
  let running = false;
  let tickTimers: ReturnType<typeof setTimeout>[] = [];
  let completion: Promise<void> | null = null;
  let resolveCompletion: (() => void) | null = null;

  const clearTimers = () => {
    for (const t of tickTimers) clearTimeout(t);
    tickTimers = [];
  };

  const scheduleBatch = async (fromIdx: number) => {
    if (!opts || paused || !running) return;
    const audioCtx = engine.getAnalyser()?.context;
    if (!audioCtx) throw new Error("AudioContext unavailable");
    await engine.ensureContext();

    const t0 = audioCtx.currentTime + 0.05;
    const step = (opts.toneDurationMs + opts.gapMs) / 1000;
    const end = Math.min(fromIdx + BATCH_SIZE, digits.length);

    for (let i = fromIdx; i < end; i++) {
      if (opts.signal.aborted || paused) return;
      const key = digitToKey(digits[i] ?? "");
      if (!key) continue;
      const when = t0 + (i - fromIdx) * step;
      void engine.playTone(key, opts.toneDurationMs, when);
      const delayMs = Math.max(0, (when - audioCtx.currentTime) * 1000);
      const timer = setTimeout(() => {
        if (!opts?.signal.aborted && running && !paused) {
          position = i;
          opts.onTick(i);
        }
      }, delayMs);
      tickTimers.push(timer);
    }

    const batchEnd = end;
    const totalMs = (batchEnd - fromIdx) * (opts.toneDurationMs + opts.gapMs);
    const waitTimer = setTimeout(async () => {
      if (opts?.signal.aborted || paused || !running) return;
      if (batchEnd >= digits.length) {
        position = digits.length;
        running = false;
        resolveCompletion?.();
        return;
      }
      await scheduleBatch(batchEnd);
    }, totalMs + 20);
    tickTimers.push(waitTimer);
  };

  return {
    async start(digitString, options) {
      clearTimers();
      engine.stopAll();
      digits = digitString;
      opts = options;
      position = 0;
      paused = false;
      running = true;

      completion = new Promise((resolve) => {
        resolveCompletion = resolve;
      });

      options.signal.addEventListener(
        "abort",
        () => {
          running = false;
          paused = false;
          clearTimers();
          engine.stopAll();
          resolveCompletion?.();
        },
        { once: true },
      );

      await scheduleBatch(0);
      return completion;
    },

    pause() {
      if (!running) return;
      paused = true;
      clearTimers();
      engine.stopAll();
    },

    resume() {
      if (!running || !opts || !paused) return;
      paused = false;
      void scheduleBatch(position);
    },

    position() {
      return position;
    },
  };
}
