#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# ビルド実行スクリプト
# プロジェクトに合わせて BUILD_CMD を変更してください
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# --- プロジェクト固有のビルドコマンド ---
# 例:
#   npm run build
#   python -m build
#   go build ./...
#   cargo build --release
# TODO: プロジェクトに合わせて以下を書き換えてください
BUILD_CMD="${BUILD_CMD:-echo 'ビルドコマンドが未設定です。scripts/build.sh を編集してください。'}"

echo "=== ビルド実行 ==="
eval "$BUILD_CMD"
echo "=== ビルド完了 ==="
