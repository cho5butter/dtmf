export type UiMode = "retro" | "modern" | "rotary";

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
} as const;

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

    const mode = storage.getItem(STORAGE_KEYS.mode) as UiMode | null;
    const settingsRaw = storage.getItem(STORAGE_KEYS.settings);
    const settings = settingsRaw
      ? (JSON.parse(settingsRaw) as PersistedSettings)
      : { ...DEFAULT_SETTINGS };

    if (!["retro", "modern", "rotary"].includes(mode ?? "")) {
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
