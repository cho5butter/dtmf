# DTMF Web Dialer UI/UX大刷新＆バグ修正 (Phase 2) 実装計画

本計画は、DTMF Webダイヤラーの基本機能を維持したまま、画面が一切動かなくなるようなバグ（ハイドレーションエラーやCSP違反など）を完全に排除し、操作して楽しいプレミアムなガジェットUI/UXへ大刷新するためのものです。

## 解決する課題 (バグ修正)
1. **ハイドレーション不整合の解消**: Astroの静的ジェネレータとSolid JS間の動的ステート（初期UIモードなど）のズレによりブラウザ上でJSが停止する問題を、`client:only="solid-js"` の採用により完全に解消します。
2. **View Transitions の安定化**: モード切り替え時のアニメーション効果を再有効化し、テスト環境での動作も安定させます。

## 実装する新機能 (デザインとUXの刷新)
1. **プレミアム・ガジェット・デザインシステム**:
   - テーマごとに洗練された HSL カラーパレットを定義（レトロ、モダン、回転）。
   - 物理ボタンの押し込み感（カチッとした立体的な沈み込み）を3Dスタイリングで表現。
   - 設定パネルなどへのガラスモーフィズム（半透明ぼかし）の適用。
2. **インタラクティブ回転ダイヤル (ドラッグ回転 & 長押し補助)**:
   - 数字穴を指やマウスでドラッグして回せる操作に対応（$\operatorname{atan2}$ による円軌道計算）。
   - 止め金衝突時のバウンド（ゴム風テンション）の演出。
   - 指を離したときのゼンマイ仕掛けの逆回転アニメーションと、戻りきった際の発音トリガー。
   - 補助操作としての「長押し自動回転＆発音」機能の併設。
3. **サイバー波形ビジュアライザ**:
   - 音声再生に同期してネオンカラーのグラデーションと光彩（glow）を施した美しいオシロスコープ波形を描画。

---

## 提案する変更内容

### [基盤・設定]
#### [MODIFY] [index.astro](file:///Users/junya/Documents/Projects/dtmf/src/pages/index.astro)
- `client:idle` から `client:only="solid-js"` に変更。

#### [MODIFY] [viewTransition.ts](file:///Users/junya/Documents/Projects/dtmf/src/lib/platform/viewTransition.ts)
- `document.startViewTransition` によるネイティブの画面遷移アニメーション処理を再実装。

### [UI・ロジック]
#### [MODIFY] [global.css](file:///Users/junya/Documents/Projects/dtmf/src/styles/global.css)
- 3つのテーマ用の HSL カラー、3Dボタン用の `.dtmf-key` 押し込みエフェクト、およびガラスモーフィズム用の CSS スタイルを追加。

#### [MODIFY] [engine.ts](file:///Users/junya/Documents/Projects/dtmf/src/lib/dtmf/engine.ts)
- 音量設定に対し、$v^2$ による簡易対数（log）変換を適用してマスターゲインに反映させる。

#### [MODIFY] [PhoneApp.tsx](file:///Users/junya/Documents/Projects/dtmf/src/islands/PhoneApp.tsx)
- アラートバナーに代わり、電源スイッチや受話器を持ち上げるようなビジュアルのアクティベーションUIを初期表示する。

#### [MODIFY] [RotaryDial.tsx](file:///Users/junya/Documents/Projects/dtmf/src/islands/RotaryDial.tsx)
- 円形ドラッグ処理（`pointerdown`, `pointermove`, `pointerup`）、止め金衝突処理、逆回転アニメーションループ、およびキー長押し補助ロジックの実装。

#### [MODIFY] [Visualizer.tsx](file:///Users/junya/Documents/Projects/dtmf/src/islands/Visualizer.tsx)
- canvasの描画コンテキストに対し `shadowBlur` や `shadowColor` を用いた発光エフェクト、および `createLinearGradient` によるネオングラデーションを適用。

---

## 検証計画

### 自動テスト
- **ユニット/コンポーネントテスト**: `rotaryAngle.test.ts` および `RotaryDial.test.tsx` のテストを更新し、ドラッグ角度計算や長押しでの自動進行、逆回転発音トリガーを検証。また、音量設定の対数マップテストも追加。
- **E2Eテスト**: `tests/e2e/rotary.spec.ts` でのドラッグ操作と長押し操作のシミュレーション、および `tests/e2e/a11y.spec.ts` でのアクセシビリティ（axe違反0件）の再検証。
- **品質ゲート**: `bash scripts/quality-gate.sh` を実行して、リント、ビルド、テストがすべて PASS することを確認。

### 手動検証
- ローカル開発サーバーを起動し、デスクトップおよびモバイルのエミュレーター上で、以下の項目を確認：
  1. モード切り替えがスムーズにクロスフェードすること。
  2. 回転ダイヤルがドラッグや長押しで回り、戻りきった際に正しいDTMF音が鳴ること。
  3. 初回アクセス時にアクティベーションUIが表示され、タップすることで有効化されること。
  4. 音量調整が滑らかに行われ、ビジュアライザがネオンカラーで美しく波打つこと。
