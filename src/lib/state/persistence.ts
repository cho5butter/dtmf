import { normalizePhoneNumber } from "../input/normalizer";

export type UiMode = "retro" | "rotary";

export interface PersistedSettings {
  toneDurationMs: number;
  gapMs: number;
  volume: number;
}

export interface PersistedState {
  schemaVersion: number;
  mode: UiMode;
  settings: PersistedSettings;
}

export const SCHEMA_VERSION = 1;
export const STORAGE_KEYS = {
  schemaVersion: "dtmf:schemaVersion",
  mode: "dtmf:mode",
  settings: "dtmf:settings",
  history: "dtmf:history",
  // F-020: 初回アクセス時の音声警告モーダルの確認済みフラグ。
  // スキーマバージョン管理とは独立のキーとし、設定リセットでも消えない。
  soundWarningAck: "dtmf:soundWarningAck",
} as const;

const MAX_HISTORY = 5;

const DEFAULT_SETTINGS: PersistedSettings = {
  toneDurationMs: 150,
  gapMs: 100,
  volume: 0.5,
};

export const DEFAULT_PERSISTED: PersistedState = {
  schemaVersion: SCHEMA_VERSION,
  mode: "retro",
  settings: { ...DEFAULT_SETTINGS },
};

function getStorage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function loadPersistedState(): PersistedState {
  const storage = getStorage();
  if (!storage) return { ...DEFAULT_PERSISTED, settings: { ...DEFAULT_SETTINGS } };

  try {
    const version = Number.parseInt(storage.getItem(STORAGE_KEYS.schemaVersion) ?? "", 10);
    if (version !== SCHEMA_VERSION) {
      return { ...DEFAULT_PERSISTED, settings: { ...DEFAULT_SETTINGS } };
    }

    const mode = storage.getItem(STORAGE_KEYS.mode);
    const settingsRaw = storage.getItem(STORAGE_KEYS.settings);
    const settings = settingsRaw
      ? (JSON.parse(settingsRaw) as PersistedSettings)
      : { ...DEFAULT_SETTINGS };

    if (!["retro", "rotary"].includes(mode ?? "")) {
      return { ...DEFAULT_PERSISTED, settings: clampSettings(settings) };
    }

    return {
      schemaVersion: SCHEMA_VERSION,
      mode: mode as UiMode,
      settings: clampSettings(settings),
    };
  } catch {
    return { ...DEFAULT_PERSISTED, settings: { ...DEFAULT_SETTINGS } };
  }
}

function clampSettings(settings: PersistedSettings): PersistedSettings {
  return {
    toneDurationMs: clamp(settings.toneDurationMs, 80, 500, DEFAULT_SETTINGS.toneDurationMs),
    gapMs: clamp(settings.gapMs, 30, 500, DEFAULT_SETTINGS.gapMs),
    volume: clamp(settings.volume, 0, 1, DEFAULT_SETTINGS.volume),
  };
}

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function saveMode(mode: UiMode): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.schemaVersion, String(SCHEMA_VERSION));
    storage.setItem(STORAGE_KEYS.mode, mode);
  } catch {
    /* ignore */
  }
}

export function saveSettings(settings: PersistedSettings): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.schemaVersion, String(SCHEMA_VERSION));
    storage.setItem(STORAGE_KEYS.settings, JSON.stringify(clampSettings(settings)));
  } catch {
    /* ignore */
  }
}

export function loadSoundWarningAck(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    return storage.getItem(STORAGE_KEYS.soundWarningAck) === "1";
  } catch {
    return false;
  }
}

export function saveSoundWarningAck(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.soundWarningAck, "1");
  } catch {
    /* ignore */
  }
}

export function loadDialHistory(): string[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEYS.history);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value): value is string => typeof value === "string")
      .map((value) => normalizePhoneNumber(value).display)
      .filter((value) => normalizePhoneNumber(value).digits.length > 0)
      .slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

export function rememberDialHistory(value: string): string[] {
  const normalized = normalizePhoneNumber(value);
  if (!normalized.digits) return loadDialHistory();

  const current = loadDialHistory();
  const next = [
    normalized.display,
    ...current.filter((item) => normalizePhoneNumber(item).digits !== normalized.digits),
  ].slice(0, MAX_HISTORY);

  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(STORAGE_KEYS.history, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}
