/** @jsxImportSource solid-js */
import { createSignal, For, onCleanup } from "solid-js";
import type { DtmfKey } from "../lib/dtmf/frequencyMap";
import { isDtmfKey } from "../lib/dtmf/frequencyMap";
import { digitToAngle, fingerStopAngle, returnAngle } from "../lib/dtmf/rotaryAngle";
import { useServices } from "../lib/state/context";
import { usePadDialRelease, useRotaryDialRelease } from "./useDialRelease";

const MAX_QUEUE = 20;
const RETURN_MS = 400;

export default function RotaryDial() {
  const { engine } = useServices();
  const { startSession, recordDigit, releaseSession } = useRotaryDialRelease(engine);
  const [rotation, setRotation] = createSignal(0);
  const [queueFull, setQueueFull] = createSignal(false);
  let queue: string[] = [];
  let processing = false;
  let fingerDown = false;
  let returnTimer: ReturnType<typeof setTimeout> | undefined;

  const processQueue = async () => {
    if (processing || queue.length === 0) return;
    processing = true;
    const digit = queue.shift();
    if (!digit || !isDtmfKey(digit)) {
      processing = false;
      return;
    }
    const start = digitToAngle(digit === "0" ? "0" : digit);
    const stop = fingerStopAngle(start);
    setRotation(stop);
    returnTimer = setTimeout(() => {
      setRotation(returnAngle(stop));
      recordDigit(digit);
      if (!fingerDown) {
        void releaseSession();
      }
      processing = false;
      setQueueFull(queue.length >= MAX_QUEUE);
      void processQueue();
    }, RETURN_MS);
  };

  const enqueueDigit = (digit: string) => {
    if (processing && queue.length >= MAX_QUEUE) {
      setQueueFull(true);
      return;
    }
    if (queue.length >= MAX_QUEUE) {
      setQueueFull(true);
      return;
    }
    queue.push(digit);
    setQueueFull(queue.length >= MAX_QUEUE);
    void processQueue();
  };

  const dialDigit = (digit: string) => {
    void engine.ensureContext().catch(() => {});
    enqueueDigit(digit);
  };

  onCleanup(() => {
    if (returnTimer) clearTimeout(returnTimer);
    queue = [];
    engine.stopAll();
  });

  const auxKeys: DtmfKey[] = ["*", "#"];
  const { onKeyDown, onKeyUp } = usePadDialRelease(engine);

  return (
    <div
      data-testid="rotary-dial"
      onPointerDown={() => {
        if (!fingerDown) startSession();
        fingerDown = true;
      }}
      onPointerUp={() => {
        fingerDown = false;
        void releaseSession();
      }}
      onPointerCancel={() => {
        fingerDown = false;
        void releaseSession();
      }}
    >
      <p class="hint-text mb-3 text-center">
        ダイヤルを回して数字を記録し、指を離すとためた分が鳴ります
      </p>
      <div
        class="rotary-disc relative mx-auto mb-4 flex h-56 w-56 items-center justify-center rounded-full"
        style={{ transform: `rotate(${rotation()}deg)` }}
      >
        <For each={["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]}>
          {(digit) => (
            <button
              type="button"
              class="rotary-hole absolute flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
              style={{
                transform: `rotate(${digitToAngle(digit)}deg) translateY(-90px)`,
              }}
              aria-label={`回転ダイヤル ${digit}`}
              data-digit={digit}
              disabled={queueFull()}
              aria-disabled={queueFull()}
              onPointerDown={() => dialDigit(digit)}
            >
              {digit}
            </button>
          )}
        </For>
      </div>
      <div class="flex justify-center gap-4">
        <For each={auxKeys}>
          {(key) => (
            <button
              type="button"
              class="dtmf-key min-w-[52px] px-4 py-2 text-base"
              aria-label={`補助キー ${key}`}
              onPointerDown={(e) => onKeyDown(key, e)}
              onPointerUp={(e) => void onKeyUp(key, e)}
              onPointerCancel={(e) => void onKeyUp(key, e)}
            >
              {key}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
