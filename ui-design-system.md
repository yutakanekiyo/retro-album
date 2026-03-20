# 🎨 UIデザインシステム設計書

> **デザインコンセプト:** モダン・ミニマルをベースに、レトロ要素をアクセントとして混ぜる。
> ベーストーンはライト（クリーム・ベージュ）。「おしゃれだけど温かい」がキーワード。

---

## 1. カラーパレット

### ベースカラー
```css
:root {
  /* 背景系 */
  --bg-primary: #FAF6F0;       /* メイン背景: 温かみのあるオフホワイト */
  --bg-secondary: #F0EBE3;     /* カード・セクション背景: ベージュ */
  --bg-tertiary: #E8E0D4;      /* ホバー・アクティブ状態 */

  /* テキスト系 */
  --text-primary: #2C2420;      /* メインテキスト: ほぼ黒だが温かみのあるダークブラウン */
  --text-secondary: #6B5E54;    /* サブテキスト: ミディアムブラウン */
  --text-tertiary: #9C8E82;     /* プレースホルダー・補助テキスト */

  /* アクセント */
  --accent-primary: #B85C3C;    /* メインアクセント: テラコッタ（ボタン等） */
  --accent-hover: #A04E30;      /* ホバー時 */
  --accent-secondary: #C4956A;  /* セカンダリアクセント: 暖かいゴールド */

  /* ユーティリティ */
  --border: #D9CFC4;            /* ボーダー */
  --border-light: #E8E0D4;      /* 軽いボーダー */
  --overlay: rgba(44, 36, 32, 0.5); /* オーバーレイ */
  --shadow: rgba(44, 36, 32, 0.08); /* 影 */
  --shadow-strong: rgba(44, 36, 32, 0.15); /* 強い影 */
}
```

### ギャラリー画面用（ダーク）
```css
.gallery {
  --gallery-bg: #1A1614;           /* ダーク背景 */
  --gallery-surface: #2C2420;      /* カード背景 */
  --gallery-text: #F0EBE3;         /* テキスト */
  --gallery-text-sub: #9C8E82;     /* サブテキスト */
  --gallery-border: #3D3530;       /* ボーダー */
}
```

---

## 2. タイポグラフィ

### フォントファミリー

```css
:root {
  /* UI用（モダン・ミニマル） */
  --font-ui: 'Inter', 'Noto Sans JP', sans-serif;

  /* 見出し・アプリ名用（レトロアクセント） */
  --font-display: 'Playfair Display', 'Noto Serif JP', serif;

  /* 手書き風（スクラップブック内テキスト用） */
  --font-handwritten: 'Caveat', 'Klee One', cursive;

  /* マーカー風（強調テキスト用） */
  --font-marker: 'Patrick Hand', 'Zen Kurenaido', cursive;
}
```

### フォントサイズ（モバイルファースト）

```css
:root {
  --text-xs: 0.6875rem;    /* 11px — 最小（キャプション・注釈） */
  --text-sm: 0.8125rem;    /* 13px — 小さいUI要素 */
  --text-base: 0.9375rem;  /* 15px — 本文 */
  --text-lg: 1.0625rem;    /* 17px — やや大きめ */
  --text-xl: 1.25rem;      /* 20px — セクション見出し */
  --text-2xl: 1.5rem;      /* 24px — 画面タイトル */
  --text-3xl: 2rem;        /* 32px — アプリ名等 */
}
```

---

## 3. 共通UIパーツ

### ボタン

```css
/* プライマリボタン */
.btn-primary {
  background: var(--accent-primary);
  color: #FAF6F0;
  font-family: var(--font-ui);
  font-size: var(--text-base);
  font-weight: 500;
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  letter-spacing: 0.02em;
  /* タップ領域: 最低44px確保 */
  min-height: 48px;
  transition: background 0.2s ease, transform 0.1s ease;
}
.btn-primary:active {
  background: var(--accent-hover);
  transform: scale(0.98);
}

/* テキストボタン（ゴースト） */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  padding: 10px 16px;
  min-height: 44px;
}
```

### アイコンボタン

```css
.btn-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-light);
  transition: background 0.2s ease;
}
.btn-icon:active {
  background: rgba(255, 255, 255, 0.9);
}
```

### 入力フィールド

```css
.input {
  font-family: var(--font-ui);
  font-size: var(--text-base);
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  min-height: 48px;
  transition: border-color 0.2s ease;
}
.input:focus {
  border-color: var(--accent-primary);
  outline: none;
  background: rgba(255, 255, 255, 0.8);
}
.input::placeholder {
  color: var(--text-tertiary);
}
```

---

## 4. ログイン画面

### レイアウト構成

```
┌─────────────────────────────┐
│ (ステータスバー)              │
│                             │
│                             │
│     [アプリ名]               │ ← Playfair Display, 32px
│     [サークル名]             │ ← 手書きフォント, 16px
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │  メールアドレス         │  │ ← 入力フィールド
│  │                       │  │
│  │  パスワード            │  │ ← 入力フィールド
│  │                       │  │
│  │  [ ログイン ]          │  │ ← プライマリボタン
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│                             │
└─────────────────────────────┘
```

### デザイン詳細

**背景:**
- ベースカラー: var(--bg-primary)
- 背景テクスチャを薄くオーバーレイ（クラフト紙 or リネン風、opacity 0.3程度）
- フィルムグレイン

**アプリ名:**
- フォント: Playfair Display（セリフ体）
- サイズ: 32px
- 色: var(--text-primary)
- 文字間隔: 0.08em（広め — 高級感）
- ウェイト: 600

**サークル名:**
- フォント: Caveat or Klee One（手書き風）
- サイズ: 16px
- 色: var(--text-secondary)
- アプリ名の下に、少し右にオフセット
- 微回転: -2° くらい（手書きで添えた感じ）

**ログインフォーム:**
- 背景: なし or 非常に薄いカード（白 8%くらい）
- 枠線なし — フォームが自然に背景に溶け込む
- 入力フィールド間の余白: 16px
- フィールドとボタンの間: 24px

**ログインボタン:**
- テキスト: 「アルバムを開く」（「ログイン」よりギフト感がある）
- スタイル: btn-primary
- 幅: フィールドと同じ幅

**装飾（控えめに）:**
- 画面の角にステッカーを1〜2個、小さく薄く配置（opacity 0.4くらい）
- 入力フォームの近くにマスキングテープを1本、さりげなく

---

## 5. スクラップブック画面のUI

### ヘッダー

```
┌─────────────────────────────┐
│ (ステータスバー)              │
│ [≡]  先輩の名前    [♫] [⊞] │ ← 左:メニュー 右:BGM, ギャラリー切替
│─────────────────────────────│
│                             │
│  (スクラップブック本体)       │
│                             │
```

**ヘッダーの仕様:**
- 高さ: 48px（コンテンツエリアを最大化）
- 背景: 透明 or 半透明白（backdrop-filter: blur(12px)）
- スクロールで非表示になる（スクロールダウンで隠れ、スクロールアップで再表示）
- 先輩の名前: font-display, text-lg, text-primary
- ボタン: btn-icon スタイル、44×44px

**ヘッダーボタン:**
- 左: ハンバーガーメニュー（将来用。今はなくてもOK）
- 右1: BGMコントロール（♫ アイコン）
- 右2: ギャラリー切替（グリッドアイコン）

### スクロール体験

- 慣性スクロール（iOS標準の -webkit-overflow-scrolling: touch）
- スナップなし — 自由にスクロール（ページ間で止まらない）
- スクロールバー非表示
```css
.scrapbook-scroll {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.scrapbook-scroll::-webkit-scrollbar {
  display: none;
}
```

### ページ間の区切り

- 明確な線やボーダーは引かない
- テクスチャの切り替わり自体がページの区切りになる
- ページ間の余白: 40〜60px（少し呼吸感を持たせる）

### 写真タップ → フルスクリーン

- 写真をタップすると、その位置からフルスクリーンに拡大するアニメーション
- 背景はオーバーレイで暗くなる（var(--overlay)）
- フルスクリーン中は左右スワイプで前後の写真に移動
- 閉じる: 下にスワイプ or 右上の×ボタン（btn-icon）
- キャプションがあれば下部に白文字で表示

---

## 6. ギャラリー画面のUI

### レイアウト

```
┌─────────────────────────────┐
│ (ステータスバー)              │
│ [←]  Gallery       [♫] [⊞] │ ← ⊞はスクラップブック切替に変わる
│─────────────────────────────│
│ ┌────┐ ┌────┐ ┌────┐       │
│ │    │ │    │ │    │       │  ← 3列グリッド
│ │    │ │    │ │    │       │
│ └────┘ └────┘ └────┘       │
│ ┌────┐ ┌────┐ ┌────┐       │
│ │    │ │    │ │    │       │
│ │    │ │    │ │    │       │
│ └────┘ └────┘ └────┘       │
│ ...                         │
└─────────────────────────────┘
```

### デザイン詳細

**背景:** var(--gallery-bg)（ダーク: #1A1614）

**グリッド:**
- 3列
- 写真間のギャップ: 2px（Retro風に狭く）
- 写真のアスペクト比: 1:1（正方形にクロップ）
- 角丸: なし or 2px（ほぼ直角）

**日付ラベル:**
- date_labelがある写真は、写真の下端に半透明のグラデーション + 白テキスト
- フォント: var(--font-ui), text-xs
- 配置: 写真の左下

**写真タップ:**
- スクラップブックと同じフルスクリーンビューアに遷移
- フルスクリーン内で左右スワイプ可能
- 背景はvar(--gallery-bg)のまま

### ヘッダー

- 背景: var(--gallery-bg)に合わせたダーク
- テキスト: var(--gallery-text)
- ギャラリー↔スクラップブックの切替アイコンを右に

---

## 7. BGMコントロールのUI

### デザイン: フローティングコントロール

スクラップブック画面・ギャラリー画面の両方で表示される。

```
┌──────────────────────┐
│  ♫   advancement bar  │ ← ミニプレーヤー風
│  ▶/❚❚    ──────○──   │
└──────────────────────┘
```

**方式A: ミニマルアイコンのみ（おすすめ）**
- ヘッダー右のアイコンボタン1つだけ
- タップで再生/停止をトグル
- 再生中: ♫アイコンが小さくパルスアニメーション（目立ちすぎない程度）
- 停止中: ♫アイコンが静止 + opacity 0.5
- 長押し or 2回タップでミュート

```css
/* 再生中のパルスアニメーション */
@keyframes music-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.bgm-playing {
  animation: music-pulse 2s ease-in-out infinite;
}
```

**方式B: 展開式（BGMを強調したい場合）**
- ヘッダーのアイコンタップでドロップダウン表示
- 曲名 + 再生/停止 + 音量スライダー
- 3秒操作がなければ自動で閉じる

**推奨: 方式A。** BGMは雰囲気を作るものなので、UIは最小限にして写真体験の邪魔をしない。

---

## 8. 画面切り替え（スクラップブック ↔ ギャラリー）

### 切替UIの位置

ヘッダー右端のアイコンボタン:
- スクラップブック画面にいるとき: グリッドアイコン（⊞）→ タップでギャラリーへ
- ギャラリー画面にいるとき: コラージュアイコン（📋風）→ タップでスクラップブックへ

### 切替アニメーション

**スクラップブック → ギャラリー:**
- スクラップブックが右にスライドアウト（or フェードアウト）
- 背景色がライト → ダークにクロスフェード（300ms）
- ギャラリーのグリッドが左からスライドイン（or 各セルがスケールイン）

**ギャラリー → スクラップブック:**
- 逆方向のアニメーション
- 背景色がダーク → ライトにクロスフェード

```css
/* 画面遷移: 300ms, ease-out */
.page-transition-enter {
  opacity: 0;
  transform: translateX(20px);
}
.page-transition-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 300ms ease-out;
}
.page-transition-exit {
  opacity: 1;
}
.page-transition-exit-active {
  opacity: 0;
  transition: opacity 200ms ease-in;
}
```

---

## 9. アニメーション・トランジション

### スクロールアニメーション（スクラップブック）

各ページの要素が視界に入ったときのアニメーション:

```
タイミング:
- 背景テクスチャ: 即座に表示（アニメーションなし）
- 写真: 0.1秒ずつ遅れてフェードイン + 軽いスケール
- マスキングテープ: 写真の後に表示
- ステッカー: さらに後に表示
- テキスト: 最後に表示
```

**Framer Motion での実装:**
```jsx
// 各写真
<motion.div
  initial={{ opacity: 0, scale: 0.9, y: 20 }}
  whileInView={{ opacity: 1, scale: 1, y: 0 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{
    duration: 0.5,
    delay: index * 0.1,  // 写真ごとに0.1秒ずつ遅れる
    ease: [0.25, 0.46, 0.45, 0.94]  // easeOutQuad
  }}
/>

// ステッカー
<motion.div
  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
  whileInView={{ opacity: 1, scale: 1, rotate: randomAngle }}
  viewport={{ once: true }}
  transition={{
    duration: 0.4,
    delay: 0.5 + index * 0.05,  // 写真の後に表示
    ease: "backOut"  // 少しバウンス感
  }}
/>
```

### ログイン → スクラップブック遷移

ログインボタン押下後:
1. ボタンが小さくスケールダウン（フィードバック）: 100ms
2. 画面全体がフェードアウト: 400ms
3. スクラップブック画面がフェードイン: 500ms
4. 最初のページの写真が順番にアニメーション表示: 上記のスクロールアニメーション

```jsx
// ログイン成功時のシーケンス
const loginSequence = {
  fadeOut: { opacity: 0, transition: { duration: 0.4 } },
  fadeIn: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
};
```

### 写真タップ → フルスクリーン

```jsx
// Framer Motion layoutId を使ったシームレスな拡大
<motion.img
  layoutId={`photo-${photo.id}`}
  transition={{
    layout: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }
  }}
/>
```

- タップした写真がその位置からスムーズに拡大
- 背景オーバーレイが同時にフェードイン
- 戻るときは逆再生

### フルスクリーン内のスワイプ

- 左右スワイプで前後の写真に切り替え
- スワイプ中は写真が指に追従
- 離したときにスナップ（次の写真 or 元の位置に戻る）
- 切り替えアニメーション: 300ms, ease-out

### 下方向スワイプで閉じる

```jsx
// フルスクリーン写真を下にスワイプで閉じる
<motion.div
  drag="y"
  dragConstraints={{ top: 0, bottom: 0 }}
  onDragEnd={(_, info) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      closeFullscreen();
    }
  }}
  style={{ y: dragY }}
  // ドラッグ中は背景オーバーレイのopacityも連動して下がる
/>
```

---

## 10. セーフエリア・レスポンシブ対応

### iOS セーフエリア

```css
/* ノッチ・Dynamic Island対応 */
.header {
  padding-top: env(safe-area-inset-top);
}
.bottom-area {
  padding-bottom: env(safe-area-inset-bottom);
}

/* PWAのスタンドアロンモード時 */
@media (display-mode: standalone) {
  .header {
    padding-top: calc(env(safe-area-inset-top) + 8px);
  }
}
```

### タップターゲット

- 全てのタップ可能な要素: 最低 44×44px
- ボタン間の余白: 最低 8px（誤タップ防止）

### 画面幅対応

- メインターゲット: iPhone（375px〜430px）
- タブレット: 768px以上では中央寄せ、最大幅500px
- デスクトップ: プレビュー用、iPhone風のフレームに入れてもOK

```css
.app-container {
  max-width: 500px;
  margin: 0 auto;
}
@media (min-width: 768px) {
  .app-container {
    /* タブレット以上ではモバイルUIを維持 */
    box-shadow: 0 0 40px var(--shadow);
    min-height: 100vh;
  }
}
```

---

## 11. PWAアイコン・スプラッシュスクリーン

### アプリアイコン
- スタイル: ベージュ背景 + アプリ名のイニシャル or ポラロイドアイコン
- 角丸: iOSが自動で適用するので正方形で用意
- サイズ: 1024×1024px（マスターから各サイズ自動生成）

### スプラッシュスクリーン
- 背景: var(--bg-primary)
- 中央: アプリアイコン or アプリ名
- シンプルに

---

*作成日: 2026年3月18日*
