/**
 * iOS Safari (16.4+) では Web Audio が既定で「着信音（ambient）」チャンネル扱いとなり、
 * 本体側面のサイレント（マナー）スイッチがオンだと本体スピーカーから音が出ない。
 *
 * `navigator.audioSession.type = "playback"` を設定すると、マナーモードでも
 * 本体スピーカーから再生されるようになる（B-11）。
 *
 * `navigator.audioSession` 非対応のブラウザ（Android Chrome / デスクトップ等）では
 * 何もしない no-op として安全に無視する。
 */
interface AudioSessionLike {
  type: string;
}

type NavigatorWithAudioSession = Navigator & { audioSession?: AudioSessionLike };

/**
 * 再生用に audioSession を構成する。設定できた場合のみ `true` を返す。
 * 例外（読み取り専用プロパティ等）は握りつぶし、呼び出し側の音声処理を妨げない。
 */
export function configureAudioSessionForPlayback(
  nav: NavigatorWithAudioSession | undefined = typeof navigator === "undefined"
    ? undefined
    : (navigator as NavigatorWithAudioSession),
): boolean {
  if (!nav?.audioSession) return false;
  try {
    nav.audioSession.type = "playback";
    return true;
  } catch {
    return false;
  }
}
