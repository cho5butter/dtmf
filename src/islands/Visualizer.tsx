/** @jsxImportSource solid-js */
import { createEffect, onCleanup, onMount } from "solid-js";
import { useServices } from "../lib/state/context";
import { appState } from "../lib/state/store";

export default function Visualizer() {
  const { engine } = useServices();
  let canvas: HTMLCanvasElement | undefined;
  let rafId = 0;

  const draw = () => {
    const analyser = engine.getAnalyser();
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const buffer = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buffer);
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
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
    ctx.strokeStyle = "#0891b2";
    ctx.lineWidth = 2;
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
    }
  });

  onMount(() => {
    canvas = document.getElementById("dtmf-visualizer") as HTMLCanvasElement | undefined;
  });

  onCleanup(() => {
    if (rafId) cancelAnimationFrame(rafId);
  });

  return (
    <canvas
      id="dtmf-visualizer"
      class="mt-4 h-24 w-full rounded-lg border border-neutral-200 bg-neutral-900"
      width="400"
      height="96"
      aria-label="音声波形ビジュアライザ"
      data-testid="visualizer"
    />
  );
}
