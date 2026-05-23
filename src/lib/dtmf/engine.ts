import {
  type AudioContextConstructor,
  createAudioContext,
  getAudioContextConstructor,
} from "../platform/audioContextFactory";
import { computeEnvelopePoints } from "./envelope";
import { DTMF_FREQUENCY_MAP, type DtmfKey, isDtmfKey } from "./frequencyMap";

export interface DtmfEngine {
  ensureContext(): Promise<void>;
  pressKey(key: DtmfKey, opts?: { maxMs?: number }): void;
  releaseKey(): void;
  playTone(key: DtmfKey, durationMs: number, when?: number): Promise<void>;
  stopAll(): void;
  setVolume(v: number): void;
  getAnalyser(): AnalyserNode | null;
  isSupported(): boolean;
}

interface ActiveTone {
  oscillators: OscillatorNode[];
  envelope: GainNode;
  timeoutId?: ReturnType<typeof setTimeout>;
}

const DEFAULT_MAX_MS = 5000;
const ABSOLUTE_MAX_MS = 10000;
const CROSSFADE_MS = 5;

export interface CreateDtmfEngineDeps {
  createContext?: () => AudioContext | null;
  AudioContextCtor?: AudioContextConstructor | null;
}

export function createDtmfEngine(deps: CreateDtmfEngineDeps = {}): DtmfEngine {
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let analyser: AnalyserNode | null = null;
  let active: ActiveTone | null = null;
  let volume = 0.5;

  const getContext = () => {
    if (ctx) return ctx;
    if (deps.createContext) {
      ctx = deps.createContext();
    } else {
      ctx = createAudioContext();
    }
    if (ctx && !masterGain) {
      masterGain = ctx.createGain();
      analyser = ctx.createAnalyser();
      masterGain.gain.value = volume;
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);
    }
    return ctx;
  };

  const stopActive = (when?: number) => {
    if (!active || !ctx) return;
    const stopAt = when ?? ctx.currentTime + CROSSFADE_MS / 1000;
    for (const osc of active.oscillators) {
      try {
        osc.stop(stopAt);
      } catch {
        /* already stopped */
      }
      osc.disconnect();
    }
    active.envelope.disconnect();
    if (active.timeoutId) clearTimeout(active.timeoutId);
    active = null;
  };

  const scheduleTone = (key: DtmfKey, durationMs: number, when: number): Promise<void> => {
    const audioCtx = getContext();
    if (!audioCtx || !masterGain) {
      return Promise.reject(new Error("AudioContext unavailable"));
    }

    stopActive(when);

    const freqs = DTMF_FREQUENCY_MAP[key];
    const envelopeGain = audioCtx.createGain();
    const oscillators = [freqs.low, freqs.high].map((frequency) => {
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = frequency;
      osc.connect(envelopeGain);
      return osc;
    });

    envelopeGain.connect(masterGain);

    const points = computeEnvelopePoints(when, durationMs, 1);
    envelopeGain.gain.setValueAtTime(points[0]?.gain ?? 0, points[0]?.time ?? when);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      if (!p) continue;
      envelopeGain.gain.linearRampToValueAtTime(p.gain, p.time);
    }

    for (const osc of oscillators) {
      osc.start(when);
      osc.stop(when + durationMs / 1000);
    }

    active = { oscillators, envelope: envelopeGain };

    return new Promise((resolve, reject) => {
      const endSec = when + durationMs / 1000;
      const delayMs = Math.max(0, (endSec - audioCtx.currentTime) * 1000);
      active!.timeoutId = setTimeout(() => {
        try {
          stopActive();
          resolve();
        } catch (err) {
          reject(err);
        }
      }, delayMs + 5);
    });
  };

  return {
    async ensureContext() {
      const audioCtx = getContext();
      if (!audioCtx) throw new Error("Web Audio API is not supported");
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
    },

    pressKey(key: DtmfKey, opts?: { maxMs?: number }) {
      const maxMs = Math.min(opts?.maxMs ?? DEFAULT_MAX_MS, ABSOLUTE_MAX_MS);
      const audioCtx = getContext();
      if (!audioCtx) return;
      void this.ensureContext();
      const when = audioCtx.currentTime;
      void scheduleTone(key, maxMs, when);
    },

    releaseKey() {
      stopActive();
    },

    playTone(key: DtmfKey, durationMs: number, when?: number) {
      const audioCtx = getContext();
      if (!audioCtx) return Promise.reject(new Error("AudioContext unavailable"));
      const start = when ?? audioCtx.currentTime;
      return scheduleTone(key, durationMs, start);
    },

    stopAll() {
      stopActive();
    },

    setVolume(v: number) {
      const linear = Math.max(0, Math.min(1, v));
      volume = linear * linear;
      if (masterGain) masterGain.gain.value = volume;
    },

    getAnalyser() {
      return analyser;
    },

    isSupported() {
      if (deps.createContext) return deps.createContext() !== null;
      return getAudioContextConstructor() !== null;
    },
  };
}

export function digitToKey(digit: string): DtmfKey | null {
  return isDtmfKey(digit) ? digit : null;
}
