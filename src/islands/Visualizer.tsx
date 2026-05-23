/** @jsxImportSource solid-js */
import { createEffect, onCleanup, onMount } from "solid-js";
import type { DtmfKey } from "../lib/dtmf/frequencyMap";
import { DTMF_FREQUENCY_MAP, isDtmfKey } from "../lib/dtmf/frequencyMap";
import { useServices } from "../lib/state/context";
import { appState } from "../lib/state/store";

export function createIdleWaveformSamples(count: number): number[] {
  return Array.from({ length: count }, () => 128);
}

export function createDtmfWaveformSamples(count: number, key: DtmfKey, phaseSeconds = 0): number[] {
  const frequency = DTMF_FREQUENCY_MAP[key];
  const sampleWindowSeconds = 1 / 85;
  return Array.from({ length: count }, (_, i) => {
    const t = phaseSeconds + (i / Math.max(1, count - 1)) * sampleWindowSeconds;
    const low = Math.sin(2 * Math.PI * frequency.low * t);
    const high = Math.sin(2 * Math.PI * frequency.high * t);
    return Math.round(128 + ((low + high) / 2) * 46);
  });
}

export default function Visualizer() {
  const { engine } = useServices();
  let canvas: HTMLCanvasElement | undefined;
  let rafId = 0;

  const readVar = (name: string, fallback: string): string => {
    if (typeof window === "undefined" || !canvas) return fallback;
    const v = getComputedStyle(canvas).getPropertyValue(name).trim();
    return v || fallback;
  };

  const isPlaying = () => appState.playback === "auto_running" || appState.playback === "key_held";

  const currentKey = (): DtmfKey | undefined => {
    const autoKey =
      appState.currentDigitIdx >= 0 ? appState.digits[appState.currentDigitIdx] : undefined;
    const manualKey = appState.digits[appState.digits.length - 1];
    const key = autoKey ?? manualKey;
    return key && isDtmfKey(key) ? key : undefined;
  };

  const draw = (playing = false) => {
    const analyser = engine.getAnalyser();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let buffer: ArrayLike<number> =
      playing && analyser ? new Uint8Array(analyser.fftSize) : createIdleWaveformSamples(96);
    if (playing && analyser) {
      analyser.getByteTimeDomainData(buffer);
    }
    const analyserIsFlat =
      playing &&
      Array.from({ length: buffer.length }, (_, i) => buffer[i] ?? 128).every((v) => v === 128);
    const key = currentKey();
    if (playing && key && (!analyser || analyserIsFlat)) {
      buffer = createDtmfWaveformSamples(128, key, performance.now() / 1000);
    }
    const { width, height } = canvas;

    const paper = readVar("--paper", "#F2EFE6");
    const signal = readVar("--signal", "#FF3B30");

    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = signal;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const sliceWidth = width / buffer.length;
    let x = 0;
    for (let i = 0; i < buffer.length; i++) {
      const v = (buffer[i] ?? 128) / 128;
      const y = (v * height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();
  };

  const loop = () => {
    draw(true);
    rafId = requestAnimationFrame(loop);
  };

  createEffect(() => {
    const playing = isPlaying();
    if (playing && !rafId) {
      rafId = requestAnimationFrame(loop);
    } else if (!playing && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
      draw(false);
    }
  });

  onMount(() => {
    canvas = document.getElementById("dtmf-visualizer") as HTMLCanvasElement | undefined;
    draw(false);
  });

  onCleanup(() => {
    if (rafId) cancelAnimationFrame(rafId);
  });

  return (
    <canvas
      id="dtmf-visualizer"
      class="visualizer"
      width="400"
      height="80"
      aria-label="音声波形ビジュアライザ"
      data-testid="visualizer"
    />
  );
}
