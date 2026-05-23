/** @jsxImportSource solid-js */
import { createEffect, onCleanup, onMount } from "solid-js";
import { useServices } from "../lib/state/context";
import { appState } from "../lib/state/store";

export function createIdleWaveformSamples(count: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const phase = (i / Math.max(1, count - 1)) * Math.PI * 4;
    return Math.round(128 + Math.sin(phase) * 18 + Math.sin(phase * 2.25) * 5);
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

  const draw = () => {
    const analyser = engine.getAnalyser();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const buffer = analyser ? new Uint8Array(analyser.fftSize) : createIdleWaveformSamples(96);
    if (analyser) {
      analyser.getByteTimeDomainData(buffer);
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
    draw();
    rafId = requestAnimationFrame(loop);
  };

  createEffect(() => {
    const playing =
      appState.playback === "auto_running" ||
      appState.playback === "key_held" ||
      appState.playback === "auto_paused";
    if (playing && !rafId) {
      rafId = requestAnimationFrame(loop);
    } else if (!playing && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
      draw();
    }
  });

  onMount(() => {
    canvas = document.getElementById("dtmf-visualizer") as HTMLCanvasElement | undefined;
    draw();
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
