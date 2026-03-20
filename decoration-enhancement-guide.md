# 🎨 デコレーション強化指示書

> **前提:** スクラップブックの骨格（レイアウト・写真配置・マスキングテープ・ポラロイド枠の基本形）は実装済み。
> この指示書は、デコレーションの **質感・バリエーション・密度** を大幅に引き上げるための具体的な改善指示です。

---

## 現状の課題

スクリーンショットを見た上での問題点:

1. **マスキングテープが単調** — 同じ形・色のテープが繰り返されていて手作り感が薄い
2. **テクスチャ・質感が足りない** — 背景がフラットなベージュで「紙」感がない
3. **デコレーション要素の種類が少ない** — テープ以外のデコがほぼない
4. **写真自体にエフェクトがない** — 全部同じトーンで、フィルム感・レトロ感が出ていない
5. **余白が寂しい** — 写真の間の空間にステッカーや手書きテキストがない
6. **全体にフィルムグレインがない** — デジタルっぽさが残っている

---

## 改善1: マスキングテープの強化

### 現状
同じ形状・色のテープが写真の角に配置されている。

### 改善内容

**形状のバリエーション（最低5種類）:**
- ちぎった感じの端（直線ではなく、少しギザギザ or 波打つ端）
- 幅のバリエーション: 細め（40px）、標準（60px）、太め（80px）
- 長さもランダムに変える

**色のバリエーション（最低8色）:**
```css
/* 実際のマスキングテープっぽい色 */
--tape-kraft: rgba(180, 155, 110, 0.7);      /* クラフト茶 */
--tape-cream: rgba(230, 220, 190, 0.6);      /* クリーム */
--tape-sage: rgba(170, 190, 160, 0.6);       /* セージグリーン */
--tape-dusty-rose: rgba(200, 160, 160, 0.6); /* くすみピンク */
--tape-sky: rgba(160, 190, 210, 0.6);        /* くすみ水色 */
--tape-lavender: rgba(180, 170, 200, 0.6);   /* ラベンダー */
--tape-mustard: rgba(210, 180, 100, 0.6);    /* マスタード */
--tape-white: rgba(240, 240, 235, 0.5);      /* 半透明白（和紙風） */
```

**半透明感が重要:** テープは不透明にしない。下の写真や紙がうっすら透けるのがリアル。opacityは0.5〜0.7。

**テクスチャ:** テープ自体に薄いノイズテクスチャを載せる。CSSで:
```css
.tape::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/textures/noise-light.png');
  opacity: 0.15;
  mix-blend-mode: multiply;
}
```

**配置のバリエーション:**
- 写真の上辺中央に1本（現状）
- 写真の対角の2つの角にX字型に2本
- 写真の片角に1本だけ斜めに
- 写真をまたぐように長めに1本

**角度:** 各テープは -20°〜+20° のランダム回転（現状より振り幅を大きく）

---

## 改善2: 背景テクスチャの強化

### 現状
フラットなベージュ/ブラウン背景。

### 改善内容

**各ページの背景に紙のテクスチャを追加する。** CSSだけで実現可能:

**クラフト紙風:**
```css
.page-kraft {
  background-color: #d4c5a9;
  background-image:
    url('/textures/paper-fiber.png'),  /* 紙の繊維テクスチャ */
    linear-gradient(
      135deg,
      rgba(0,0,0,0.03) 0%,
      transparent 50%,
      rgba(0,0,0,0.02) 100%
    );
  /* 紙の微妙な影・ムラを再現 */
}
```

**方眼紙風:**
```css
.page-grid {
  background-color: #f5f3eb;
  background-image:
    linear-gradient(rgba(180,180,180,0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(180,180,180,0.2) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

**コンクリート/壁風:**
```css
.page-concrete {
  background-color: #b8b5b0;
  background-image: url('/textures/concrete.png');
  background-size: 400px 400px;
}
```

**コルクボード風:**
```css
.page-cork {
  background-color: #c4a76c;
  background-image: url('/textures/cork.png');
  background-size: 300px 300px;
}
```

**ダーク（黒板風）:**
```css
.page-chalkboard {
  background-color: #2a3a2a;
  background-image: url('/textures/chalkboard.png');
  /* この背景の場合、テープやテキストは白系・パステル系に */
}
```

**テクスチャ画像はCSSだけでも近似できる:**
紙の繊維テクスチャが用意できない場合、CSS noiseで代用:
```css
.page-paper {
  background-color: #d4c5a9;
  position: relative;
}
.page-paper::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
  background-size: 256px 256px;
  pointer-events: none;
}
```

**ページ間の境界:**
各ページの境界にも工夫を。フラットに切れるのではなく:
- ちぎれた紙の端風のSVGボーダー
- or ページ間に薄いシャドウ
- or マスキングテープがページをまたぐ

---

## 改善3: ステッカー・スタンプの追加（新規）

### 現状
ステッカーなし。

### 追加内容

写真の間の余白や、ページの角にランダムにステッカーを配置する。

**ステッカーの種類（SVGで作成、最低15〜20種類）:**

イベサーの雰囲気に合うもの:
- ビール/乾杯グラス
- カメラ/写ルンです風
- ハート（手書き風）
- 星（きらきら）
- 音符
- 飛行機/旅行
- サングラス
- ピース/指サイン
- 「BEST」「LOVE」「MEMORIES」等の英単語スタンプ
- 日付スタンプ風（消印風の丸枠に日付）
- キラキラ/スパークル
- 炎/fire
- 王冠
- リボン
- 吹き出し（中にテキスト）

**スタイル:**
- 手描き風のラフな線（完璧な形ではなくラフさが大事）
- 色: 暖色系メイン（赤、オレンジ、マスタード、ピンク）+ アクセントに青・緑
- 一部はモノクロ（黒インクのスタンプ風）

**配置ルール:**
- 1ページあたり3〜6個のステッカーをランダム配置
- 写真の上に少し重なるのもOK（z-indexを写真より上に）
- サイズ: 24px〜56px のランダム
- 角度: -30°〜+30° のランダム
- 写真と写真の間の余白を中心に配置

---

## 改善4: 手書きテキストの強化

### 現状
キャプション・日付のテキスト表示が基本的なフォント。

### 改善内容

**Google Fontsから手書き風フォントを複数使う:**
```
- Caveat（英語の手書き）
- Klee One（日本語の手書き風）
- Zen Kurenaido（日本語の丸い手書き風）
- Patrick Hand（英語のカジュアル手書き）
- Homemade Apple（英語の筆記体っぽい手書き）
```

**テキストの種類と配置:**

1. **キャプション（写真に紐づくテキスト）:**
   - ポラロイド枠の下部に手書きフォントで表示
   - or 写真の横に付箋風のメモとして配置

2. **日付ラベル（date_label）:**
   - 消印/スタンプ風のデザイン: 丸い枠の中に日付
   - or 手書きフォントで斜めに配置

3. **デコレーション用テキスト（写真とは無関係に装飾として）:**
   - ページの余白に「memories」「good times」「best day ever」等を手書きフォントで散りばめる
   - 先輩の名前をページのどこかに手書き風で入れる
   - サークル名を小さく入れる
   - これらはDBから取るのではなく、あらかじめ用意したテキスト配列からランダムに選ぶ

**テキストの装飾:**
```css
/* インクっぽい手書き感 */
.handwritten {
  font-family: 'Caveat', 'Klee One', cursive;
  color: #3a3a3a;
  transform: rotate(var(--random-angle)); /* -5° 〜 +5° */
  /* にじみ感 */
  text-shadow: 0 0 1px rgba(0,0,0,0.1);
}

/* マーカーで書いた風 */
.marker-text {
  font-family: 'Patrick Hand', cursive;
  color: #c0392b; /* 赤マーカー */
  font-size: 1.2em;
  /* 蛍光マーカーの下線 */
  background: linear-gradient(transparent 60%, rgba(255, 255, 0, 0.3) 60%);
  display: inline;
}
```

---

## 改善5: 切り抜き文字（コラージュタイポグラフィ）の追加

### 現状
なし。

### 追加内容

リファレンス画像（1枚目の "A PERSON WHO IS MADDY"）のような、雑誌の切り抜きを貼り付けた風のタイポグラフィ。

**使う場所:**
- 各ページに1つ、先輩の名前 or サークルに関するフレーズを切り抜き文字で配置
- 例: 先輩の名前「タナカ」を1文字ずつ異なるスタイルで

**実装:**
```jsx
// 文字列を1文字ずつ分解して、各文字に異なるスタイルを適用
const CutoutText = ({ text }) => {
  const fonts = ['Georgia', 'Impact', 'Courier New', 'Arial Black', 'Times New Roman'];
  const colors = ['#2c2c2c', '#8b0000', '#003366', '#2d4a22', '#4a3728'];
  const bgColors = ['#f5f0e0', '#e8d5d5', '#d5dce8', '#dce8d5', 'transparent'];

  return (
    <div className="flex items-end gap-[1px]">
      {text.split('').map((char, i) => (
        <span
          key={i}
          style={{
            fontFamily: fonts[Math.floor(Math.random() * fonts.length)],
            fontSize: `${18 + Math.random() * 16}px`,  // 18〜34px
            fontWeight: Math.random() > 0.5 ? 'bold' : 'normal',
            color: colors[Math.floor(Math.random() * colors.length)],
            backgroundColor: bgColors[Math.floor(Math.random() * bgColors.length)],
            padding: '2px 4px',
            transform: `rotate(${(Math.random() - 0.5) * 8}deg)`,  // -4° 〜 +4°
            display: 'inline-block',
            lineHeight: 1,
            border: Math.random() > 0.7 ? '1px solid #ccc' : 'none',
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};
```

**注意:** ランダム値はコンポーネントのマウント時に1回だけ生成してstateに保存する。レンダーのたびにランダムが変わるとチラつく。ただし、ページ全体の再生成時（アプリを開き直した時）にはランダムが変わるようにする。

---

## 改善6: 写真自体へのエフェクト

### 現状
写真は元のまま表示されている。

### 改善内容

各写真にランダムでフィルムっぽいエフェクトを適用する。全部の写真に同じエフェクトではなく、ランダムにバラつかせる。

**エフェクトのバリエーション（CSSフィルターで実現）:**

```css
/* エフェクト1: セピア（軽め） */
.photo-sepia {
  filter: sepia(0.2) saturate(0.9);
}

/* エフェクト2: 色褪せ（フェード） */
.photo-faded {
  filter: brightness(1.05) contrast(0.9) saturate(0.8);
}

/* エフェクト3: 高コントラスト（フィルム風） */
.photo-film {
  filter: contrast(1.15) saturate(1.1) brightness(0.95);
}

/* エフェクト4: 暖色寄り */
.photo-warm {
  filter: sepia(0.1) saturate(1.2) hue-rotate(-5deg);
}

/* エフェクト5: エフェクトなし（元のまま） */
.photo-none {
  filter: none;
}
```

**ビネット（周辺減光）:**
写真の30〜40%にランダムでビネットを追加:
```css
.photo-vignette::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
}
```

**適用ルール:**
- 各写真に上記エフェクトの中から1つをランダムに適用
- 約30%の写真にビネットを追加
- 全写真に同じエフェクトがかからないようにする（見た目の多様性が大事）

---

## 改善7: フィルムグレイン（全体オーバーレイ）

### 現状
なし。

### 追加内容

画面全体に薄いフィルムグレイン（ノイズ）をオーバーレイする。

```css
/* グローバルに適用（layoutコンポーネント or _app に） */
.film-grain {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;  /* 最前面 */
  opacity: 0.04;  /* 非常に薄く — これが重要、強すぎると邪魔 */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
}
```

**ポイント:**
- opacity は 0.03〜0.06 の範囲で調整。写真の邪魔にならないギリギリの薄さ
- z-index を最前面にして、全ての要素の上にかける
- pointer-events: none で操作の邪魔にならないようにする
- 静的なノイズで十分（アニメーションさせると重くなる）

---

## 改善8: 写真の影・立体感

### 現状
写真がフラットに見える。

### 改善内容

写真に紙っぽい影をつけて「テーブルの上に置かれた写真」感を出す:

```css
/* 基本の影（全写真に適用） */
.photo-shadow {
  box-shadow:
    2px 3px 8px rgba(0, 0, 0, 0.15),   /* メインの影 */
    0 1px 3px rgba(0, 0, 0, 0.1);       /* 接地感 */
}

/* ポラロイド枠つきの写真はもう少し浮かせる */
.polaroid-shadow {
  box-shadow:
    3px 5px 15px rgba(0, 0, 0, 0.2),
    0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 一部の写真は角がめくれた風の影 */
.photo-curl {
  position: relative;
}
.photo-curl::after {
  content: '';
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 50%;
  height: 30px;
  background: transparent;
  box-shadow: 8px 8px 12px rgba(0, 0, 0, 0.15);
  transform: rotate(3deg);
  z-index: -1;
}
```

---

## 改善9: 余白を埋めるデコレーション

### 現状
写真の間の余白がただの背景色。

### 改善内容

余白に以下をランダム配置して「スクラップブックを作った人の存在感」を出す:

1. **落書き風のSVGイラスト:**
   - 矢印（手書き風、写真を指す）
   - ハートや星のラフスケッチ
   - 波線、ぐるぐる、点線
   - 小さな花や葉っぱの落書き

2. **ランダムなテキスト断片:**
   - 「→ この日最高だった」
   - 「笑」
   - 「永遠に忘れない」
   - 「BEST MEMORY」
   - 「☆」
   - これらを手書きフォントで余白にランダム配置

3. **紙の切れ端風:**
   - ノートの切れ端風の小さな四角形（罫線つき）にテキスト
   - 付箋風のメモ（角が折れた四角形 + パステルカラー）

**配置ロジック:**
- 写真の配置後に、写真と写真の間の余白領域を計算
- 余白が十分にある箇所にのみデコレーションを配置
- 写真に重なるデコレーション（ステッカー等）は少量にする
- 1ページあたりのデコレーション量は控えめ〜密のランダム

---

## 実装の優先順位

最も効果が大きい順に:

1. **背景テクスチャの強化（改善2）** — これだけでフラット感が大幅に解消される
2. **フィルムグレイン追加（改善7）** — 全体のレトロ感が一気に上がる。1行のCSSで済む
3. **写真の影・立体感（改善8）** — 写真が「置かれてる」感じが出る
4. **写真エフェクト（改善6）** — 写真自体のレトロ感
5. **マスキングテープ強化（改善1）** — バリエーションと半透明感
6. **ステッカー追加（改善3）** — にぎやかさ・手作り感
7. **手書きテキスト強化（改善4）** — 温かみ
8. **余白デコレーション（改善9）** — 密度感
9. **切り抜き文字（改善5）** — おしゃれさ・インパクト

---

*作成日: 2026年3月18日*
