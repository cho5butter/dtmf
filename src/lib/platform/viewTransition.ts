export function runViewTransition(update: () => void): void {
  if (
    typeof document !== "undefined" &&
    typeof window !== "undefined" &&
    "startViewTransition" in document &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    document.startViewTransition(() => {
      update();
    });
    return;
  }
  update();
}
