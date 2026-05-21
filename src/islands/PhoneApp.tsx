/** @jsxImportSource solid-js */
import { onMount, Show } from "solid-js";
import { createDtmfEngine } from "../lib/dtmf/engine";
import { createAutoDialSequencer } from "../lib/dtmf/sequencer";
import { ServicesProvider } from "../lib/state/context";
import { appState, setAudioSupported, setContextSuspended } from "../lib/state/store";
import NumberInput from "./NumberInput";
import Toast from "./Toast";

const engine = createDtmfEngine();
const sequencer = createAutoDialSequencer(engine);

export default function PhoneApp() {
  onMount(() => {
    const supported = engine.isSupported();
    setAudioSupported(supported);
    if (!supported) {
      document.getElementById("audio-unsupported")?.classList.remove("hidden");
    }
    engine.setVolume(appState.settings.volume);
    return () => engine.stopAll();
  });

  const onFirstInteraction = () => {
    void engine
      .ensureContext()
      .then(() => setContextSuspended(false))
      .catch(() => setContextSuspended(true));
  };

  return (
    <ServicesProvider value={{ engine, sequencer }}>
      <div
        class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
        onPointerDown={onFirstInteraction}
        data-testid="phone-app"
      >
        <Show when={appState.audio.contextSuspended}>
          <p class="mb-4 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900" role="status">
            画面をタップして音を有効にしてください
          </p>
        </Show>
        <Show when={!appState.audio.supported}>
          <p class="mb-4 text-sm text-red-700" role="alert">
            Web Audio API に対応していません
          </p>
        </Show>
        <NumberInput />
      </div>
      <Toast />
    </ServicesProvider>
  );
}
