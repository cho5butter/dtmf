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
# TODO: プロジェクトに合わせて以下を書き換えてください
TEST_CMD="${TEST_CMD:-echo 'テストコマンドが未設定です。scripts/test.sh を編集してください。'}"

echo "=== テスト実行 ==="
eval "$TEST_CMD"
echo "=== テスト完了 ==="
