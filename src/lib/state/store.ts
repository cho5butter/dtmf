import { createStore } from "solid-js/store";
import { normalizePhoneNumber } from "../input/normalizer";
import {
  loadDialHistory,
  loadPersistedState,
  type PersistedSettings,
  rememberDialHistory,
  saveMode,
  saveSettings,
  type UiMode,
} from "./persistence";

export type Playback = "idle" | "key_held" | "auto_running" | "auto_paused";

export type ToastKind = "info" | "warn" | "error";

export interface ToastState {
  kind: ToastKind;
  message: string;
}

export interface AppState {
  raw: string;
  display: string;
  digits: string;
  hadInternationalPrefix: boolean;
  currentDigitIdx: number;
  playback: Playback;
  mode: UiMode;
  settings: PersistedSettings;
  audio: {
    supported: boolean;
    contextSuspended: boolean;
  };
  history: string[];
  toast: ToastState | null;
}

const persisted = loadPersistedState();

export const [appState, setAppState] = createStore<AppState>({
  raw: "",
  display: "",
  digits: "",
  hadInternationalPrefix: false,
  currentDigitIdx: -1,
  playback: "idle",
  mode: persisted.mode,
  settings: { ...persisted.settings },
  audio: {
    supported: true,
    contextSuspended: false,
  },
  history: loadDialHistory(),
  toast: null,
});

export function setInput(raw: string) {
  const result = normalizePhoneNumber(raw);
  setAppState({
    raw,
    display: result.display,
    digits: result.digits,
    hadInternationalPrefix: result.hadInternationalPrefix,
  });
  if (result.truncated) {
    pushToast({
      kind: "warn",
      message: "最大64桁まで。先頭から64桁のみ使用します",
    });
  }
}

export function setMode(mode: UiMode) {
  setAppState("mode", mode);
  saveMode(mode);
}

export function setSettings(partial: Partial<PersistedSettings>) {
  const next = { ...appState.settings, ...partial };
  setAppState("settings", next);
  saveSettings(next);
}

export function setPlayback(playback: Playback) {
  setAppState("playback", playback);
}

export function setCurrentDigitIdx(idx: number) {
  setAppState("currentDigitIdx", idx);
}

export function recordPlaybackHistory(value = appState.display) {
  const next = rememberDialHistory(value);
  setAppState("history", next);
}

export function pushToast(toast: ToastState) {
  setAppState("toast", toast);
}

export function dismissToast() {
  setAppState("toast", null);
}

export function setAudioSupported(supported: boolean) {
  setAppState("audio", "supported", supported);
}

export function setContextSuspended(suspended: boolean) {
  setAppState("audio", "contextSuspended", suspended);
}

export function resetPlayback() {
  setAppState({
    playback: "idle",
    currentDigitIdx: -1,
  });
}
