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
          class="fixed right-4 bottom-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur-md"
          classList={{
            "border-blue-500/30 bg-blue-500/15 text-blue-100": toast().kind === "info",
            "border-amber-500/30 bg-amber-500/15 text-amber-100": toast().kind === "warn",
            "border-red-500/30 bg-red-500/15 text-red-100": toast().kind === "error",
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
