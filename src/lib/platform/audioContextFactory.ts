export type AudioContextConstructor = new (options?: AudioContextOptions) => AudioContext;

let cachedContext: AudioContext | null = null;
let injectedCtor: AudioContextConstructor | null = null;

export function injectAudioContextConstructor(ctor: AudioContextConstructor | null) {
  injectedCtor = ctor;
  cachedContext = null;
}

export function getAudioContextConstructor(): AudioContextConstructor | null {
  if (injectedCtor) return injectedCtor;
  if (typeof globalThis === "undefined") return null;
  const w = globalThis as typeof globalThis & {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

export function createAudioContext(): AudioContext | null {
  const Ctor = getAudioContextConstructor();
  if (!Ctor) return null;
  if (!cachedContext) {
    cachedContext = new Ctor();
  }
  return cachedContext;
}

export function resetAudioContextForTests() {
  cachedContext = null;
  injectedCtor = null;
}
