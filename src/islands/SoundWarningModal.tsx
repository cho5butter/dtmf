/** @jsxImportSource solid-js */
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { loadSoundWarningAck, saveSoundWarningAck } from "../lib/state/persistence";

/**
 * F-020: 初回アクセス時に音声警告モーダルを表示すべきかを判定する。
 * 確認済みフラグが localStorage にある場合は表示しない。
 */
export function shouldShowSoundWarning(): boolean {
  return !loadSoundWarningAck();
}

interface SoundWarningModalProps {
  /** F-021: 確認操作（OK / Escape）と同時に音声（AudioContext）を有効化するためのコールバック */
  onAcknowledge?: () => void;
}

export default function SoundWarningModal(props: SoundWarningModalProps) {
  const [visible, setVisible] = createSignal(false);
  let okButton: HTMLButtonElement | undefined;

  const acknowledge = () => {
    saveSoundWarningAck();
    setVisible(false);
    props.onAcknowledge?.();
  };

  // モーダル表示中は背後の PhoneApp の DTMF/Enter ハンドラへキー入力が伝播しないよう抑止し、
  // Escape のみ確認操作として扱う。
  const handleKeydown = (event: KeyboardEvent) => {
    if (!visible()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      acknowledge();
      return;
    }
    // OK ボタン 1 つにフォーカスを閉じ込める簡易フォーカストラップ。
    event.stopPropagation();
  };

  onMount(() => {
    if (shouldShowSoundWarning()) {
      setVisible(true);
      // 描画後に OK ボタンへフォーカスを移す。
      queueMicrotask(() => okButton?.focus());
    }
    document.addEventListener("keydown", handleKeydown, true);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeydown, true);
  });

  return (
    <Show when={visible()}>
      <div class="sound-modal__overlay" role="presentation">
        <div
          class="sound-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sound-modal-title"
          aria-describedby="sound-modal-desc"
          data-testid="sound-warning-modal"
        >
          <h2 id="sound-modal-title" class="sound-modal__title">
            音が鳴ります
          </h2>
          <p id="sound-modal-desc" class="sound-modal__desc">
            このアプリはボタン操作で音（電話のダイヤル音）が鳴ります。音量にご注意ください。
          </p>
          <button
            type="button"
            class="t-btn t-btn--primary"
            data-testid="sound-warning-ok"
            ref={okButton}
            onClick={acknowledge}
          >
            <span class="t-btn__label">OK</span>
          </button>
        </div>
      </div>
    </Show>
  );
}
