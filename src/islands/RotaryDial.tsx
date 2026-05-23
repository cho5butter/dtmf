/** @jsxImportSource solid-js */
import { createSignal, For, onCleanup } from "solid-js";
import type { DtmfKey } from "../lib/dtmf/frequencyMap";
import { isDtmfKey } from "../lib/dtmf/frequencyMap";
import { digitToAngle, fingerStopAngle, returnAngle } from "../lib/dtmf/rotaryAngle";
import { useServices } from "../lib/state/context";
import { appState, setPlayback } from "../lib/state/store";
import { usePadDialRelease, useRotaryDialRelease } from "./useDialRelease";

const MAX_QUEUE = 20;
const RETURN_MS = 400;
const WIND_MS = 360;

export default function RotaryDial() {
  const { engine } = useServices();
  const { startSession, recordDigit, releaseSession } = useRotaryDialRelease(engine);
  const [rotation, setRotation] = createSignal(0);
  const [queueFull, setQueueFull] = createSignal(false);
  const [activeDigit, setActiveDigit] = createSignal<string | undefined>();
  let queue: string[] = [];
  let processing = false;
  let fingerDown = false;
  let activeFrame: number | undefined;
  let animationToken = 0;
  let disposed = false;
  let releaseWaiters: Array<() => void> = [];

  const shouldReduceMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

  const animateRotation = async (from: number, to: number, duration: number) => {
    if (activeFrame) cancelAnimationFrame(activeFrame);
    const token = ++animationToken;
    if (shouldReduceMotion() || duration <= 0) {
      setRotation(to);
      return;
    }
    setRotation(from);
    await new Promise<void>((resolve) => {
      const startedAt = performance.now();
      const step = (now: number) => {
        if (disposed || token !== animationToken) {
          resolve();
          return;
        }
        const progress = Math.min(1, (now - startedAt) / duration);
        setRotation(from + (to - from) * ease(progress));
        if (progress < 1) {
          activeFrame = requestAnimationFrame(step);
          return;
        }
        setRotation(to);
        resolve();
      };
      activeFrame = requestAnimationFrame(step);
    });
  };

  const waitForFingerRelease = async () => {
    if (!fingerDown) return;
    await new Promise<void>((resolve) => {
      releaseWaiters.push(resolve);
    });
  };

  const releaseFinger = (e: PointerEvent & { currentTarget: HTMLElement }) => {
    fingerDown = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const waiters = releaseWaiters;
    releaseWaiters = [];
    for (const resolve of waiters) resolve();
  };

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
    setActiveDigit(digit);
    await animateRotation(0, stop, WIND_MS);
    if (disposed) return;
    recordDigit(digit);
    await waitForFingerRelease();
    if (disposed) return;
    setPlayback("key_held");
    try {
      await Promise.all([releaseSession(), animateRotation(stop, returnAngle(stop), RETURN_MS)]);
    } finally {
      if (appState.playback === "key_held") setPlayback("idle");
    }
    setActiveDigit(undefined);
    processing = false;
    setQueueFull(queue.length >= MAX_QUEUE);
    void processQueue();
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
    disposed = true;
    animationToken++;
    if (activeFrame) cancelAnimationFrame(activeFrame);
    for (const resolve of releaseWaiters) resolve();
    releaseWaiters = [];
    queue = [];
    engine.stopAll();
  });

  const auxKeys: DtmfKey[] = ["*", "#"];
  const rotaryDigits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const { onKeyDown, onKeyUp } = usePadDialRelease(engine);

  return (
    <div
      class="rotary"
      data-testid="rotary-dial"
      onPointerDown={(e) => {
        if (!fingerDown) startSession();
        fingerDown = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerUp={releaseFinger}
      onPointerCancel={releaseFinger}
    >
      <p class="rotary__hint">黒電話のように戻る間に鳴ります</p>
      <div class="rotary__face">
        <div class="rotary__stop" aria-hidden="true" />
        <div class="rotary__wheel" style={{ transform: `rotate(${rotation()}deg)` }}>
          <For each={rotaryDigits}>
            {(digit) => (
              <span
                class="rotary__wheel-hole"
                style={{
                  transform: `rotate(${digitToAngle(digit)}deg) translateY(var(--rotary-hole-radius))`,
                }}
                aria-hidden="true"
              />
            )}
          </For>
        </div>
        <div class="rotary__number-ring">
          <For each={rotaryDigits}>
            {(digit) => (
              <button
                type="button"
                class="rotary__number"
                style={{
                  transform: `rotate(${digitToAngle(digit)}deg) translateY(var(--rotary-number-radius)) rotate(-${digitToAngle(digit)}deg)`,
                }}
                aria-label={`回転ダイヤル ${digit}`}
                data-digit={digit}
                data-active={activeDigit() === digit ? "true" : undefined}
                disabled={queueFull()}
                aria-disabled={queueFull()}
                onPointerDown={() => dialDigit(digit)}
              >
                {digit}
              </button>
            )}
          </For>
        </div>
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
