/** @jsxImportSource solid-js */
import { createEffect, onCleanup, Show } from "solid-js";
import { appState, dismissToast } from "../lib/state/store";

export default function Toast() {
  createEffect(() => {
    const toast = appState.toast;
    if (!toast) return;
    const timer = setTimeout(() => dismissToast(), 4000);
    onCleanup(() => clearTimeout(timer));
  });

  return (
    <Show when={appState.toast}>
      {(toast) => (
        <div class="toast" data-kind={toast().kind} role="status" aria-live="polite">
          {toast().message}
        </div>
      )}
    </Show>
  );
}
