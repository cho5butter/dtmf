import { describe, expect, test } from "bun:test";
import { configureAudioSessionForPlayback } from "../../src/lib/platform/audioSession";

/**
 * B-11 回帰テスト群。
 *
 * iOS Safari (16.4+) では Web Audio が既定で「着信音」チャンネル扱いとなり、
 * 本体側面のサイレント（マナー）スイッチがオンだと本体スピーカーから音が出ない。
 * `navigator.audioSession.type = "playback"` を設定すると、マナーモードでも
 * 本体スピーカーから再生されるようになる。
 */
describe("configureAudioSessionForPlayback (B-11 iOS silent switch)", () => {
  test("sets navigator.audioSession.type to 'playback' when supported", () => {
    const session = { type: "auto" };
    const nav = { audioSession: session } as unknown as Navigator;
    expect(configureAudioSessionForPlayback(nav)).toBe(true);
    expect(session.type).toBe("playback");
  });

  test("returns false (no-op) when audioSession is unsupported", () => {
    const nav = {} as Navigator;
    expect(configureAudioSessionForPlayback(nav)).toBe(false);
  });

  test("returns false when navigator is undefined", () => {
    expect(configureAudioSessionForPlayback(undefined)).toBe(false);
  });

  test("swallows assignment errors and returns false", () => {
    const nav = {
      audioSession: {
        get type() {
          return "auto";
        },
        set type(_v: string) {
          throw new Error("read-only in this environment");
        },
      },
    } as unknown as Navigator;
    expect(configureAudioSessionForPlayback(nav)).toBe(false);
  });
});
