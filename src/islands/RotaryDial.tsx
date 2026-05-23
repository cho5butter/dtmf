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
      class="rotary"
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
      <p class="rotary__hint">回して指を離すと、ためた分が鳴ります</p>
      <div class="rotary__disc" style={{ transform: `rotate(${rotation()}deg)` }}>
        <For each={["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]}>
          {(digit) => (
            <button
              type="button"
              class="rotary__hole"
              style={{
                transform: `rotate(${digitToAngle(digit)}deg) translateY(-105px)`,
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
      <div class="rotary__aux">
        <For each={auxKeys}>
          {(key) => (
            <button
              type="button"
              class="rotary__aux-btn"
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
