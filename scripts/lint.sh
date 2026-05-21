#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# リント・フォーマット実行スクリプト
# プロジェクトに合わせて LINT_CMD / FORMAT_CMD を変更してください
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# --- プロジェクト固有のリント/フォーマットコマンド ---
# 例:
#   npx eslint . --fix && npx prettier --write .
#   ruff check --fix . && ruff format .
#   golangci-lint run --fix
#   cargo fmt && cargo clippy --fix
# TODO: プロジェクトに合わせて以下を書き換えてください
LINT_CMD="${LINT_CMD:-echo 'リントコマンドが未設定です。scripts/lint.sh を編集してください。'}"
FORMAT_CMD="${FORMAT_CMD:-echo 'フォーマットコマンドが未設定です。scripts/lint.sh を編集してください。'}"

echo "=== リント実行 ==="
eval "$LINT_CMD"
echo "=== フォーマット実行 ==="
eval "$FORMAT_CMD"
echo "=== リント・フォーマット完了 ==="
