# プロジェクト進行ステータス

<!-- このファイルはセッションをまたいでフェーズ状態を記録するためのファイルである -->
<!-- AIエージェントはセッション開始時に必ずこのファイルを参照し、現在フェーズを把握すること -->
<!-- フェーズが進んだ際は、ユーザーの承認後にこのファイルを更新すること -->

## 現在フェーズ

**フェーズ**: 実装（Phase 3 補正 / 計画 P3-J 完了）
**ステータス**: ユーザー再指摘「回転の数字配置がおかしい（画像どおりにすべき）」「Clear ボタンがダサい・他のボタンと質感を合わせて入力欄の右側に置け」を受けて、設計 P3-12 / 計画 P3-J を `spec/` に追加。フェイス向きを実機写真どおりに再校正（1=2時 / 0=5時 / 止め金 4時 / 3=12時 / 9=6時）し、Clear ボタンを `rotary__aux-btn` と同じハードシャドウ＋hair枠の側列ボタンへ刷新、`display__screen` の右隣（`.display__row`）に配置した。

```
[x] フェーズ1: 要件定義(v1)
[x] フェーズ2: 設計(v1)
[x] フェーズ3: 計画(v1)
[x] フェーズ4: 実装(v1)
[x] フェーズ1: 要件定義(Phase 2)
[x] フェーズ2: 設計(Phase 2)
[x] フェーズ3: 計画(Phase 2)
[/] フェーズ4: 実装(Phase 2)
[x] フェーズ1: 要件定義(Phase 3)
[x] フェーズ2: 設計(Phase 3)
[x] フェーズ3: 計画(Phase 3)
[x] フェーズ4: 実装(Phase 3)
```

## フェーズ履歴

| フェーズ | 開始日 | 承認日 | 担当AI | 備考 |
|--------|--------|--------|--------|------|
| 要件定義 | 2026-05-20 | 2026-05-21 | Claude Code (Opus 4.7) | `spec/requirements.md` 完成。ユーザー指示「設計を進めて」で承認 |
| 設計 | 2026-05-21 | 2026-05-21 | Claude Code (Opus 4.7) | `spec/design.md` 初稿作成。PR #2 にてユーザー指示「承認します」で承認 |
| 計画 | 2026-05-21 | 2026-05-21 | Claude Code (Opus 4.7) | `spec/plan.md` 初稿作成（計画1〜15 + 最終計画「脆弱性レビュー」）。PR #3 にてユーザー指示「承認します」で承認 |
| 実装 | 2026-05-21 | — | Cursor Agent | 計画1〜15 + 脆弱性レビュー実施。`bash scripts/quality-gate.sh` PASS。その後 PR #21 等の CI 修正・Dependabot 経由の依存更新・GitHub Pages 本番デプロイ成功（`main`） |
| 要件定義 (Phase 2) | 2026-05-23 | 2026-05-23 | Gemini 3.5 Flash | UI/UX大刷新とバグ修正の追加要件定義。ユーザー指示「承認」で承認 |
| 設計 (Phase 2) | 2026-05-23 | 2026-05-23 | Gemini 3.5 Flash | デザイン・UX大刷新のための設計完了。ユーザーの「はい」指示で承認 |
| 計画 (Phase 2) | 2026-05-23 | 2026-05-23 | Gemini 3.5 Flash | 実装計画完了。ユーザーの「承認ちます」指示で承認 |
| 実装 (Phase 2) | 2026-05-23 | — | Cursor Agent | ミニマルUI・ためて解放 UX・`client:only`・品質ゲート PASS |
| 要件定義(v2 監査) | 2026-05-23 | — | Claude Code (Opus 4.7) | `main` 上で UI/UX 監査（F-011〜F-013 / B1〜B8 追記）。ブランチ実装と統合予定 |
| 要件定義 (Phase 3) | 2026-05-23 | 2026-05-23 | Claude Code (Opus 4.7) | デザイン完全再構築（F-014〜F-018 / NFR-012〜014）。PR #27 マージで承認 |

## 直近の状況

**最後に実施したこと**:

*ロゴ・ファビコン・サービス名「ピポる」（本ブランチ / 2026-05-24）*:
- ユーザー提供のライト/ダーク用ロゴ・電話アイコンを透過 SVG として `public/` に配置
- `BrandLogo.astro` で `prefers-color-scheme` に応じた横長ロゴをヘッダー表示
- `Head.astro` でライト/ダーク別ファビコン + ページタイトル/説明を「ピポる」に更新
- `bash scripts/quality-gate.sh` PASS

*UI ヘルパー文言の削除（以前 / 2026-05-24）*:
- ユーザー指示「回転ヒント・操作説明・フッター注記・GitHub リンクを UI から削除」
- `Footer.astro` 削除、`index.astro` からフッター参照を除去
- `RotaryDial.tsx` の `rotary__hint` を削除
- `NumberInput.tsx` の操作説明ヒントを削除（国際番号 `+` のみ条件表示を維持）
- 未使用 CSS（`.rotary__hint` / `.site-footer`）を整理
- `bash scripts/quality-gate.sh` PASS

**以前の実施内容**:

*既存（`main` マージ済み）*:
- 回転ダイヤル「止め金まで回る → 指離し → 戻り」、波形同期、PC レイアウト再構成
- `SettingsPanel` / `DetailPanel` を PC 幅（>=1024px）でデフォルト展開
- `.gitignore` に `.claude/` を追加

*実機相当ダイヤル補正（PR / 2026-05-23）*:
- ユーザー指示「実物のダイヤル電話を解析してもっと現実に近づけて」
- `spec/requirements.md` F-003 改訂、`spec/design.md` P3-9 追加
- `rotaryAngle.ts`: 半ステップ 18°、`pulseCount` / `returnDurationMs`
- `engine.ts`: `playRotaryPulses`（戻り中クリック音）
- `RotaryDial.tsx`: 等速戻り、DTMF は戻り完了後、指穴 `data-active`
- `global.css`: 5時方向指止め、`base - digit_angle` 数字配置、指穴ハイライト

*黒電話の物理構造再現（2026-05-23 追補）*:
- ユーザー指示「数字の上にダイヤルがくるはず。黒電話を参考にして」
- `global.css`: 数字とフィンガーホイール穴を同一半径に統一、ホイールを透明縁取りディスクへ、z-index を「数字＝下層 / ホイール＝上層」に逆転
- `RotaryDial.tsx`: 前回試行した数字リング回転を撤回（数字は完全固定）

*Clear ボタン追加 / 二重入力バグ修正（PR #36 / 2026-05-23 マージ済）*:
- ユーザー報告「スマホで Input に数字入力すると二回入力される」「Clear ボタンが欲しい」
- `spec/requirements.md` に F-019（Clear ボタン）/ B-09（二重入力バグ）を追加
- `spec/design.md` に P3-10 セクションを追加、`spec/plan.md` に計画 P3-I を追加
- `PhoneApp.tsx` / `NumberInput.tsx` 修正、新規テスト 8 件

*回転ダイヤル 30° 刻み再校正 + Clear ボタン体裁刷新（PR #37 マージ済）*:
- ユーザー指摘「回転で数字が均等配置されるのはおかしい」「ストッパーは 0 と 1 の間」「Clear ボタンがダサい」
- `spec/requirements.md` F-003 を改訂（30° 刻み・90° 隙間・止め金は 0/1 間「1」寄り）
- `spec/design.md` に P3-11 セクションを追加（P3-9 へ改訂注記）
- `rotaryAngle.ts`: `DEGREES_PER_STEP` 36→30、`FINGER_STOP_OFFSET` 18→0
- `global.css`: `--rotary-base-rotation` 132→150（=stop_angle）、コメント更新。Clear ボタンを 11px mono + signal 下線スタイルに刷新
- `tests/unit/rotaryAngle.test.ts` を新ジオメトリに合わせて改訂・拡充（隙間 90° の検証追加）
- `bash scripts/quality-gate.sh` PASS（77 tests / 18.81 KB gzip）

*フェイス向き再校正 + Clear ボタン側列配置（本 PR / 2026-05-23）*:
- ユーザー再指摘「回転の数字配置がおかしい（画像どおりにすべき）」「Clear ボタンがダサい・他のボタンと質感を合わせて入力欄の右側に置け」
- `spec/requirements.md` F-003 / F-019 を改訂、`spec/design.md` に P3-12 を追加（P3-11 へ改訂注記）、`spec/plan.md` に計画 P3-J を追加
- `rotaryAngle.ts`: `FINGER_STOP_OFFSET` 0 → 30（止め金は数字穴 N の N+1 ステップ先）
- `global.css`: `--rotary-base-rotation` 150 → 90、`--rotary-stop-angle` 150 → 120。Clear ボタンを `.rotary__aux-btn` と同じ hair 枠 + hard shadow に刷新、`.display__row` を追加して `.display__screen` の右隣に配置（隠し input も同 row 内に移動）
- `tests/unit/rotaryAngle.test.ts` を新オフセット（N×30°+30°）に合わせて改訂
- `bash scripts/quality-gate.sh` PASS（77 tests / 18.82 KB gzip）

**次のアクション**:
1. 本ブランチを push し draft PR を作成
2. PR レビュー → マージ後、GitHub Pages でロゴ（ライト/ダーク）とファビコンの表示を確認
3. 添付画像の書体と完全一致が必要な場合は、オリジナル SVG/PNG の差し替えを検討

**ブロッカー・懸念事項**:
- v1 実装は GitHub Pages に既にデプロイ済み。マージ時に再デプロイされる
- `bun audit` で Astro 5.18.1 に moderate/low 2件（静的サイトのため実害リスクは低）
- Biome は既存の未使用変数・CSS specificity 等の警告を出すが、品質ゲート自体は PASS
- 今回のレビュー修正は既存 Phase 3 実装の UI/挙動調整として実施。仕様差分として正式反映が必要な場合は後続で要件/設計へ追記する

## プロジェクト初期化チェックリスト

- [x] `README.md` をプロジェクト内容に合わせて書き換えた
- [x] `spec/requirements.md` のTODOプレースホルダーを記述し始めた
- [x] `spec/design.md` のTODOプレースホルダーを記述し始めた
- [x] `spec/plan.md` のTODOプレースホルダーを記述し始めた
- [x] `scripts/lint.sh` をプロジェクトに合わせて書き換えた
- [x] `scripts/build.sh` をプロジェクトに合わせて書き換えた
- [x] `scripts/test.sh` をプロジェクトに合わせて書き換えた
- [x] `.github/dependabot.yml` で使用する `package-ecosystem` のコメントアウトを解除した
- [x] `bash scripts/setup-hooks.sh` を実行してpre-commitフックを有効化した

## ステータス更新ルール

- フェーズが進むたびに「現在フェーズ」と「フェーズ履歴」を更新する
- 更新はユーザーの承認を得た後に行う
- 「直近の状況」はセッション終了時に必ず更新する
