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
        <div
          class="fixed right-4 bottom-4 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg"
          classList={{
            "border-blue-200 bg-blue-50 text-blue-900": toast().kind === "info",
            "border-amber-200 bg-amber-50 text-amber-900": toast().kind === "warn",
            "border-red-200 bg-red-50 text-red-900": toast().kind === "error",
          }}
          role="status"
          aria-live="polite"
        >
          {toast().message}
        </div>
      )}
    </Show>
  );
}
