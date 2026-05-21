export class FakeGainNode {
  gain = {
    value: 1,
    setValueAtTime: (_v: number, _t: number) => {},
    linearRampToValueAtTime: (_v: number, _t: number) => {},
  };
  connectCalls: unknown[] = [];
  disconnectCalls = 0;

  connect(destination: unknown) {
    this.connectCalls.push(destination);
    return destination;
  }

  disconnect() {
    this.disconnectCalls += 1;
  }
}

export class FakeOscillatorNode {
  frequency = { value: 0 };
  type = "sine";
  started = false;
  stopped = false;
  startCalls: number[] = [];
  stopCalls = 0;
  connectCalls: unknown[] = [];

  constructor(public readonly context: FakeAudioContext) {}

  connect(destination: unknown) {
    this.connectCalls.push(destination);
    return destination;
  }

  start(when = 0) {
    this.started = true;
    this.startCalls.push(when);
  }

  stop(when = 0) {
    this.stopped = true;
    this.stopCalls += 1;
    this.context.scheduleStop(when, () => {
      this.stopped = true;
    });
  }

  disconnect() {}
}

export class FakeAnalyserNode {
  fftSize = 2048;
  connectCalls: unknown[] = [];

  constructor(public readonly context: FakeAudioContext) {}

  connect(destination: unknown) {
    this.connectCalls.push(destination);
    return destination;
  }

  disconnect() {}
  getByteTimeDomainData(_array: Uint8Array) {}
}

export class FakeAudioDestinationNode {
  connectCalls: unknown[] = [];
  connect(destination: unknown) {
    this.connectCalls.push(destination);
    return destination;
  }
}

type ScheduledFn = () => void;

export class FakeAudioContext {
  currentTime = 0;
  sampleRate = 48_000;
  state: AudioContextState = "suspended";
  destination = new FakeAudioDestinationNode();
  resumeCalls = 0;
  createdNodes: {
    oscillators: FakeOscillatorNode[];
    gains: FakeGainNode[];
    analysers: FakeAnalyserNode[];
  } = { oscillators: [], gains: [], analysers: [] };

  private scheduled: Array<{ at: number; fn: ScheduledFn }> = [];

  async resume() {
    this.resumeCalls += 1;
    this.state = "running";
  }

  createOscillator() {
    const node = new FakeOscillatorNode(this);
    this.createdNodes.oscillators.push(node);
    return node;
  }

  createGain() {
    const node = new FakeGainNode();
    this.createdNodes.gains.push(node);
    return node;
  }

  createAnalyser() {
    const node = new FakeAnalyserNode(this);
    this.createdNodes.analysers.push(node);
    return node;
  }

  scheduleStop(at: number, fn: ScheduledFn) {
    this.scheduled.push({ at, fn });
  }

  advanceTime(deltaSec: number) {
    this.currentTime += deltaSec;
    const due = this.scheduled.filter((s) => s.at <= this.currentTime);
    this.scheduled = this.scheduled.filter((s) => s.at > this.currentTime);
    for (const item of due) {
      item.fn();
    }
  }
}

export type FakeAudioContextLike = FakeAudioContext;
