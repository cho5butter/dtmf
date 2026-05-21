export interface EnvelopePoint {
  time: number;
  gain: number;
}

const DEFAULT_ATTACK_MS = 8;
const DEFAULT_RELEASE_MS = 8;

export function computeEnvelopePoints(
  startTime: number,
  durationMs: number,
  gain: number,
  attackMs = DEFAULT_ATTACK_MS,
  releaseMs = DEFAULT_RELEASE_MS,
): EnvelopePoint[] {
  if (gain < 0 || durationMs < 0 || attackMs < 0 || releaseMs < 0) {
    throw new RangeError("Envelope parameters must be non-negative");
  }

  if (gain === 0 || durationMs === 0) {
    return [
      { time: startTime, gain: 0 },
      { time: startTime + durationMs / 1000, gain: 0 },
    ];
  }

  const durationSec = durationMs / 1000;
  const attackSec = attackMs / 1000;
  const releaseSec = releaseMs / 1000;
  const endTime = startTime + durationSec;

  const rampTotal = attackSec + releaseSec;
  let peakGain = gain;
  if (durationSec < rampTotal) {
    peakGain = gain * (durationSec / rampTotal);
  }

  const sustainEnd = Math.max(startTime + attackSec, endTime - releaseSec);

  return [
    { time: startTime, gain: 0 },
    { time: startTime + attackSec, gain: peakGain },
    { time: sustainEnd, gain: peakGain },
    { time: endTime, gain: 0 },
  ];
}
