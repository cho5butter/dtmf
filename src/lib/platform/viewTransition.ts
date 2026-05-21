/** UI 更新。View Transition API は環境差で E2E が不安定なため同期更新のみ。 */
export function runViewTransition(update: () => void): void {
  update();
}
