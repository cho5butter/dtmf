const DIGIT_COUNT = 10;
const DEGREES_PER_STEP = 36;
const FINGER_STOP_OFFSET = 10;

export function digitToAngle(digit: string): number {
  const n = Number.parseInt(digit, 10);
  if (Number.isNaN(n) || n < 0 || n > 9) {
    throw new RangeError(`Invalid rotary digit: ${digit}`);
  }
  return n * DEGREES_PER_STEP;
}

export function angleToDigit(angle: number): string {
  const normalized = ((angle % 360) + 360) % 360;
  const idx = Math.round(normalized / DEGREES_PER_STEP) % DIGIT_COUNT;
  return String(idx);
}

export function fingerStopAngle(digitAngle: number): number {
  return digitAngle + FINGER_STOP_OFFSET;
}

export function returnAngle(fingerStop: number): number {
  void fingerStop;
  return 0;
}
