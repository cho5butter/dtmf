export const DTMF_FREQUENCY_MAP = {
  "1": { low: 697, high: 1209 },
  "2": { low: 697, high: 1336 },
  "3": { low: 697, high: 1477 },
  "4": { low: 770, high: 1209 },
  "5": { low: 770, high: 1336 },
  "6": { low: 770, high: 1477 },
  "7": { low: 852, high: 1209 },
  "8": { low: 852, high: 1336 },
  "9": { low: 852, high: 1477 },
  "*": { low: 941, high: 1209 },
  "0": { low: 941, high: 1336 },
  "#": { low: 941, high: 1477 },
} as const;

export type DtmfKey = keyof typeof DTMF_FREQUENCY_MAP;

export const DTMF_KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "*",
  "0",
  "#",
] as const satisfies readonly DtmfKey[];

export function isDtmfKey(char: string): char is DtmfKey {
  return char in DTMF_FREQUENCY_MAP;
}
