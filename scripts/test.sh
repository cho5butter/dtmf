#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# テスト実行スクリプト
# プロジェクトに合わせて TEST_CMD を変更してください
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# --- プロジェクト固有のテストコマンドをここに記載 ---
# 例:
#   npm test
#   pytest
#   go test ./...
#   cargo test
#   make test
TEST_CMD="${TEST_CMD:-bun test --conditions=browser tests/unit tests/component && bun run size-limit}"
if [ "${RUN_E2E:-}" = "1" ]; then
  TEST_CMD="$TEST_CMD && bunx playwright test"
fi

echo "=== テスト実行 ==="
eval "$TEST_CMD"
echo "=== テスト完了 ==="
