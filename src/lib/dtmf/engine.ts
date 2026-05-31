import {
  type AudioContextConstructor,
  createAudioContext,
  getAudioContextConstructor,
} from "../platform/audioContextFactory";
import { configureAudioSessionForPlayback } from "../platform/audioSession";
import { computeEnvelopePoints } from "./envelope";
import { DTMF_FREQUENCY_MAP, type DtmfKey, isDtmfKey } from "./frequencyMap";

export interface DtmfEngine {
  ensureContext(): Promise<void>;
  pressKey(key: DtmfKey, opts?: { maxMs?: number }): void;
  releaseKey(): void;
  playTone(key: DtmfKey, durationMs: number, when?: number): Promise<void>;
  /**
   * 回転ダイヤル戻り中のパルスクリック音を `count` 個、`intervalMs` 間隔で再生する。
   * 黒電話のガラガラ機構を模した短い帯域ノイズで、DTMF とは別レイヤ。
   */
  playRotaryPulses(count: number, intervalMs: number): void;
  stopAll(): void;
  setVolume(v: number): void;
  getAnalyser(): AnalyserNode | null;
  /** AudioContext の現在状態を返す（未生成時は生成して観測）。suspended 判定に使う。 */
  getContextState(): AudioContextState | null;
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
/** この秒数以内の開始は「即時」とみなし、押下トーンの切り替えで前音を止める */
const IMMEDIATE_THRESHOLD_SEC = 0.02;

export interface CreateDtmfEngineDeps {
  createContext?: () => AudioContext | null;
  AudioContextCtor?: AudioContextConstructor | null;
}

export function createDtmfEngine(deps: CreateDtmfEngineDeps = {}): DtmfEngine {
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let analyser: AnalyserNode | null = null;
  let active: ActiveTone | null = null;
  const scheduled: ActiveTone[] = [];
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
      // B-11: iOS のサイレントスイッチ下でも本体スピーカーへ出力するため
      // audioSession を playback に構成する（非対応環境では no-op）。
      configureAudioSessionForPlayback();
    }
    return ctx;
  };

  const disposeTone = (tone: ActiveTone, stopAt?: number) => {
    if (!ctx) return;
    const stopTime = stopAt ?? ctx.currentTime + CROSSFADE_MS / 1000;
    for (const osc of tone.oscillators) {
      try {
        osc.stop(stopTime);
      } catch {
        /* already stopped */
      }
      osc.disconnect();
    }
    tone.envelope.disconnect();
    if (tone.timeoutId) clearTimeout(tone.timeoutId);
  };

  const stopActive = (when?: number) => {
    if (!active || !ctx) return;
    disposeTone(active, when ?? ctx.currentTime + CROSSFADE_MS / 1000);
    active = null;
  };

  const stopScheduled = () => {
    for (const tone of scheduled) {
      disposeTone(tone);
    }
    scheduled.length = 0;
  };

  const activePulseTimers: Array<ReturnType<typeof setTimeout>> = [];
  const activePulseSources: AudioNode[] = [];

  const stopPulses = () => {
    for (const t of activePulseTimers) clearTimeout(t);
    activePulseTimers.length = 0;
    for (const node of activePulseSources) {
      try {
        (node as AudioBufferSourceNode).stop?.();
      } catch {
        /* already stopped */
      }
      node.disconnect();
    }
    activePulseSources.length = 0;
  };

  const scheduleClick = (when: number) => {
    const audioCtx = getContext();
    if (!audioCtx || !masterGain) return;
    // 短い帯域ノイズで「カチッ」を表現
    const durationSec = 0.025;
    const sampleRate = audioCtx.sampleRate;
    const length = Math.max(1, Math.floor(durationSec * sampleRate));
    const buffer = audioCtx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // 鋭い立ち上がり → 急減衰
      const envelope = (1 - t) ** 2;
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const clickGain = audioCtx.createGain();
    clickGain.gain.value = 0.35;
    // 高域強調で「カチッ」感を出すハイパスを通す
    const hp = audioCtx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1800;
    source.connect(hp);
    hp.connect(clickGain);
    clickGain.connect(masterGain);
    source.start(when);
    activePulseSources.push(source, hp, clickGain);
    source.onended = () => {
      try {
        source.disconnect();
        hp.disconnect();
        clickGain.disconnect();
      } catch {
        /* noop */
      }
    };
  };

  const scheduleTone = (key: DtmfKey, durationMs: number, when: number): Promise<void> => {
    const audioCtx = getContext();
    if (!audioCtx || !masterGain) {
      return Promise.reject(new Error("AudioContext unavailable"));
    }

    const isImmediate = when <= audioCtx.currentTime + IMMEDIATE_THRESHOLD_SEC;
    if (isImmediate) {
      stopActive(when);
    }

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

    const tone: ActiveTone = { oscillators, envelope: envelopeGain };
    if (isImmediate) {
      active = tone;
    } else {
      scheduled.push(tone);
    }

    return new Promise((resolve, reject) => {
      const endSec = when + durationMs / 1000;
      const delayMs = Math.max(0, (endSec - audioCtx.currentTime) * 1000);
      tone.timeoutId = setTimeout(() => {
        try {
          if (isImmediate && active === tone) {
            active = null;
          } else {
            const idx = scheduled.indexOf(tone);
            if (idx >= 0) scheduled.splice(idx, 1);
          }
          disposeTone(tone);
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
      // ユーザージェスチャの度に再構成しておく（iOS で稀にリセットされるため）。
      configureAudioSessionForPlayback();
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

    playRotaryPulses(count: number, intervalMs: number) {
      const audioCtx = getContext();
      if (!audioCtx || count <= 0) return;
      stopPulses();
      const startSec = audioCtx.currentTime;
      for (let i = 0; i < count; i++) {
        scheduleClick(startSec + (i * intervalMs) / 1000);
      }
    },

    stopAll() {
      stopActive();
      stopScheduled();
      stopPulses();
    },

    setVolume(v: number) {
      const linear = Math.max(0, Math.min(1, v));
      volume = linear * linear;
      if (masterGain) masterGain.gain.value = volume;
    },

    getAnalyser() {
      return analyser;
    },

    getContextState() {
      const audioCtx = getContext();
      return audioCtx ? audioCtx.state : null;
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
