#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Git フックのセットアップ
# hooks/ ディレクトリのフックを .git/hooks/ にインストールする
#
# 使い方:
#   bash scripts/setup-hooks.sh
#
# このスクリプトは以下のいずれかの方法でフックを有効化する:
#   1. git config core.hooksPath を設定（Git 2.9+）
#   2. フォールバック: シンボリックリンクを作成
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$REPO_ROOT/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
    echo "エラー: hooks/ ディレクトリが見つかりません"
    exit 1
fi

# Git 2.9+ の core.hooksPath を使用
GIT_VERSION=$(git --version | sed 's/git version //')
GIT_MAJOR=$(echo "$GIT_VERSION" | cut -d. -f1)
GIT_MINOR=$(echo "$GIT_VERSION" | cut -d. -f2)

if [ "$GIT_MAJOR" -gt 2 ] || { [ "$GIT_MAJOR" -eq 2 ] && [ "$GIT_MINOR" -ge 9 ]; }; then
    git config core.hooksPath hooks
    echo "Git フックを設定しました (core.hooksPath = hooks)"
else
    # フォールバック: シンボリックリンクを作成
    for hook in "$HOOKS_DIR"/*; do
        hook_name=$(basename "$hook")
        target="$REPO_ROOT/.git/hooks/$hook_name"
        ln -sf "$hook" "$target"
        echo "フックをインストールしました: $hook_name"
    done
fi

# フックに実行権限を付与
chmod +x "$HOOKS_DIR"/*

echo ""
echo "セットアップ完了: pre-commit フックが有効化されました"
echo "コミット時に自動で品質ゲート（リント・ビルド・テスト）が実行されます"
