# ピポる（Piporu）

公衆電話のマウスピースに向けて、ブラウザから DTMF（Dual-Tone Multi-Frequency）トーンを生成・再生する静的 Web ダイヤラーです。

## 技術スタック

- [Astro](https://astro.build/) 5（静的出力）
- [Solid](https://www.solidjs.com/)（アイランド UI）
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Bun](https://bun.sh/)（パッケージ管理・テスト）
- [Biome](https://biomejs.dev/)（リント・フォーマット）
- [Playwright](https://playwright.dev/)（E2E・アクセシビリティ）

## セットアップ

```bash
bun install
bash scripts/setup-hooks.sh
```

## 開発

```bash
bun run dev
```

## 品質ゲート

```bash
bash scripts/quality-gate.sh
```

E2E を含むテスト:

```bash
CI=true RUN_E2E=1 bash scripts/test.sh
```

## 配信

GitHub Pages: https://cho5butter.github.io/dtmf/

## ライセンス

MIT — 詳細は [LICENSE](LICENSE)
