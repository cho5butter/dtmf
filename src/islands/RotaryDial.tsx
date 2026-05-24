/** @jsxImportSource solid-js */
import { createSignal, For, onCleanup } from "solid-js";
import type { DtmfKey } from "../lib/dtmf/frequencyMap";
import { isDtmfKey } from "../lib/dtmf/frequencyMap";
import {
  digitToAngle,
  fingerStopAngle,
  pulseCount,
  returnAngle,
  returnDurationMs,
} from "../lib/dtmf/rotaryAngle";
import { useServices } from "../lib/state/context";
import { appState, setPlayback } from "../lib/state/store";
import { usePadDialRelease, useRotaryDialRelease } from "./useDialRelease";

const MAX_QUEUE = 20;
const WIND_MS = 280;
const PULSE_INTERVAL_MS = 100;

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

  const easeOut = (t: number) => 1 - (1 - t) ** 2;
  const linear = (t: number) => t;

  const animateRotation = async (
    from: number,
    to: number,
    duration: number,
    easing: (t: number) => number = easeOut,
  ) => {
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
        setRotation(from + (to - from) * easing(progress));
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
    // 指で穴を引っ掛けて止め金まで回す（実機では指の感触のあるイージング）
    await animateRotation(0, stop, WIND_MS, easeOut);
    if (disposed) return;
    recordDigit(digit);
    await waitForFingerRelease();
    if (disposed) return;
    setPlayback("key_held");
    // 戻り中: 実機ガバナ調速器に倣う等速戻り + N 個のパルス音
    const pulses = pulseCount(digit);
    const returnMs = returnDurationMs(digit, PULSE_INTERVAL_MS);
    if (!shouldReduceMotion()) {
      engine.playRotaryPulses(pulses, PULSE_INTERVAL_MS);
    }
    try {
      await animateRotation(stop, returnAngle(stop), returnMs, linear);
      // 戻り完了直後に DTMF を 1 音だけ送出（公衆電話ダイヤル用途）
      if (!disposed) await releaseSession();
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
      <div class="rotary__face">
        {/* 指止め: ベース盤の5時方向に固定 (--rotary-stop-angle) */}
        <div class="rotary__stop" aria-hidden="true" />
        {/* 回転ディスク（指穴あり） */}
        <div class="rotary__wheel" style={{ transform: `rotate(${rotation()}deg)` }}>
          <For each={rotaryDigits}>
            {(digit) => (
              <span
                class="rotary__wheel-hole"
                data-active={activeDigit() === digit ? "true" : undefined}
                style={{
                  "--digit-angle": `${digitToAngle(digit)}deg`,
                  transform:
                    "rotate(calc(var(--rotary-base-rotation) - var(--digit-angle))) translateY(var(--rotary-hole-radius))",
                }}
                aria-hidden="true"
              />
            )}
          </For>
        </div>
        {/*
         * 数字プレート: 実機の文字盤に相当する固定レイヤー。
         * 穴あきフィンガーディスク（rotary__wheel）の下に位置し、
         * 穴を通して数字が覗き見える構造（黒電話 NTT 600形 相当）。
         */}
        <div class="rotary__number-ring">
          <For each={rotaryDigits}>
            {(digit) => {
              const angle = digitToAngle(digit);
              return (
                <button
                  type="button"
                  class="rotary__number"
                  style={{
                    "--digit-angle": `${angle}deg`,
                    transform:
                      "rotate(calc(var(--rotary-base-rotation) - var(--digit-angle))) translateY(var(--rotary-number-radius)) rotate(calc(var(--digit-angle) - var(--rotary-base-rotation)))",
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
              );
            }}
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
