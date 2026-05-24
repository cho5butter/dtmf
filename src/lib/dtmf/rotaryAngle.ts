/**
 * 黒電話風 ロータリーダイヤルの角度モデル。
 *
 * 物理モデル: NTT 600/601 形（および WE 500）パルス式ダイヤルに準じる。
 * - 数字穴は 1 ステップ = 30° 間隔で 10 個並び、合計 270° の円弧を占める。
 *   残り 90° は穴のない「指止め用の隙間」で、止め金はこの隙間にある。
 * - 「N をダイヤルする」とは指を N の穴に入れ、ディスクを時計回りに
 *   止め金まで回す動作。実機では戻り中に N 個のパルスが発生する。
 * - 止め金は「1」の穴から時計回りに 1 ステップ（30°）先にあり、
 *   結果として回転量は N × 30°（1 が最小=30°、0 が最大=300°）。
 *   「0」と「1」の間の隙間（90°幅）に止め金が位置し、止め金は「1」寄り
 *   （「1」から 30°、「0」から 60°）に置かれる。
 *
 * 本モジュールは論理角度（数字 N の基準位置と回転量）のみを管理し、
 * 見た目の向き（「1」を 4 時方向に表示する等）は CSS の rotation offset で扱う。
 */

const DIGIT_COUNT = 10;
const DEGREES_PER_STEP = 30;
/**
 * 指止め（finger stopper）のオフセット。
 * 数字穴 N の論理位置 (= N×30°) が、そのまま止め金までの回転量に一致する。
 * （止め金は「1」のさらに 1 ステップ先、ディスク基準で 0° 位置にある）
 */
const FINGER_STOP_OFFSET = 0;

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

/**
 * パルス数: 数字 N を戻すとき実機が発するパルスの個数。
 * 1〜9 はその数、0 は 10。
 */
export function pulseCount(digit: string): number {
  const n = Number.parseInt(digit, 10);
  if (Number.isNaN(n) || n < 0 || n > 9) {
    throw new RangeError(`Invalid rotary digit: ${digit}`);
  }
  return n === 0 ? DIGIT_COUNT : n;
}

/**
 * 戻り時間（ms）: 実機ガバナ調速器の 10 パルス/秒 ≈ 100ms/パルス に近似。
 * 数字に比例。
 */
export function returnDurationMs(digit: string, pulseIntervalMs = 100): number {
  return pulseCount(digit) * pulseIntervalMs;
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
