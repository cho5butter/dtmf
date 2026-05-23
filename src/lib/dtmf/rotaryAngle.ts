const DIGIT_COUNT = 10;
const DEGREES_PER_STEP = 36;
const FINGER_STOP_OFFSET = 10;

export function digitToAngle(digit: string): number {
  const n = Number.parseInt(digit, 10);
  if (Number.isNaN(n) || n < 0 || n > 9) {
    throw new RangeError(`Invalid rotary digit: ${digit}`);
  }
  const step = n === 0 ? DIGIT_COUNT : n;
  return step * DEGREES_PER_STEP;
}

export function angleToDigit(angle: number): string {
  const step = Math.round(angle / DEGREES_PER_STEP);
  const idx = ((step % DIGIT_COUNT) + DIGIT_COUNT) % DIGIT_COUNT;
  return String(idx);
}

export function fingerStopAngle(digitAngle: number): number {
  return digitAngle + FINGER_STOP_OFFSET;
}

export function returnAngle(fingerStop: number): number {
  void fingerStop;
  return 0;
}

export function rotationKeyframes(from: number, to: number, maxStep = 90): number[] {
  if (maxStep <= 0) {
    throw new RangeError("maxStep must be positive");
  }
  const delta = to - from;
  if (delta === 0) return [from];
  const direction = Math.sign(delta);
  const frames = [from];
  let current = from;
  while (Math.abs(to - current) > maxStep) {
    current += direction * maxStep;
    frames.push(current);
  }
  frames.push(to);
  return frames;
}
