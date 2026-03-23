'use client'

import { useState } from 'react'
import { makeRng, STICKER_ASSETS, TEXT_STICKER_ASSETS, TAPE_ASSETS, TEXTURE_ASSETS, NOISE_SVG } from '@/lib/albumAssets'
import type { RecordInfo } from '@/lib/albumAssets'

// p9・p10 が欠番のため除外
const TORN_PAPER_ASSETS = [1,2,3,4,5,6,7,8,11,12,13].map(n => `/assets/torn-paper/p${n}.png`)

const DECO_TEXTS = [
  'memories ♡', 'good times', 'best day ever', 'forever', 'summer',
  '最高！', '笑', 'また行こう', '忘れない', 'LOVE', '思い出',
  'precious', 'always', 'cheers ♡', 'happy days', '✦ ✦',
  'wild & free', '感謝', 'together', '→',
]

// 4ゾーン（中央のレコード+カードエリアを回避）
// 上: top 1-18% / 下: top 80-97% / 左: left 0-20% / 右: left 78-98%
function safePosFromRng(rng: () => number): { top: number; left: number } {
  const zone = Math.floor(rng() * 4)
  if (zone === 0) return { top: 1  + rng() * 17, left: 3  + rng() * 92 }  // 上
  if (zone === 1) return { top: 80 + rng() * 16, left: 3  + rng() * 92 }  // 下
  if (zone === 2) return { top: 18 + rng() * 60, left: 0  + rng() * 19 }  // 左
  return              { top: 18 + rng() * 60, left: 79 + rng() * 19 }  // 右
}

type TapeItem   = { src: string; top: number; left: number; width: number; rotation: number }
type StickerItem = { src: string; size: number; rotation: number; opacity: number; top: number; left: number }
type DecoItem   = { text: string; top: number; left: number; rotation: number }
type TornItem   = { src: string; top: number; left: number; width: number; rotation: number; opacity: number }

interface DecoData {
  textureUrl: string
  tapes: TapeItem[]
  stickers: StickerItem[]
  decos: DecoItem[]
  tornPieces: TornItem[]
}

function buildDecoData(): DecoData {
  const seed = (Math.random() * 1e9) | 0

  // テクスチャ（ランダム）
  const textureUrl = TEXTURE_ASSETS[Math.floor(Math.random() * TEXTURE_ASSETS.length)]

  // マスキングテープ 3〜5個
  const tapeCount = 3 + Math.floor(Math.random() * 3)
  const tapes = Array.from({ length: tapeCount }, (_, i): TapeItem => {
    const rng = makeRng(seed + i * 113)
    const pos = safePosFromRng(rng)
    return {
      src:      TAPE_ASSETS[Math.floor(rng() * 20)],
      top:      pos.top,
      left:     pos.left,
      width:    55 + Math.floor(rng() * 85),
      rotation: -35 + rng() * 70,
    }
  })

  // ステッカー（通常 + テキスト）15〜22個
  const stickerCount  = 15 + Math.floor(Math.random() * 8)
  const textStickerCount = Math.floor(Math.random() * 5)  // 0〜4個
  const stickers: StickerItem[] = [
    // 通常ステッカー
    ...Array.from({ length: stickerCount }, (_, i): StickerItem => {
      const rng = makeRng(seed + i * 997 + 1000)
      const pos = safePosFromRng(rng)
      return {
        src:      STICKER_ASSETS[Math.floor(rng() * STICKER_ASSETS.length)],
        size:     32 + rng() * 110,
        rotation: -30 + rng() * 60,
        opacity:  0.78 + rng() * 0.22,
        top:      pos.top,
        left:     pos.left,
      }
    }),
    // テキストステッカー
    ...Array.from({ length: textStickerCount }, (_, i): StickerItem => {
      const rng = makeRng(seed + i * 1777 + 5000)
      const pos = safePosFromRng(rng)
      return {
        src:      TEXT_STICKER_ASSETS[Math.floor(rng() * TEXT_STICKER_ASSETS.length)],
        size:     55 + rng() * 130,
        rotation: -20 + rng() * 40,
        opacity:  0.82 + rng() * 0.18,
        top:      pos.top,
        left:     pos.left,
      }
    }),
  ]

  // 手書きデコ 3〜5個
  const decoCount = 3 + Math.floor(Math.random() * 3)
  const decos = Array.from({ length: decoCount }, (_, i): DecoItem => {
    const rng = makeRng(seed + i * 2003 + 2000)
    const pos = safePosFromRng(rng)
    return {
      text:     DECO_TEXTS[Math.floor(rng() * DECO_TEXTS.length)],
      top:      pos.top,
      left:     pos.left,
      rotation: -8 + rng() * 16,
    }
  })

  // ちぎれ紙 2〜5枚
  const tornCount = 2 + Math.floor(Math.random() * 4)
  const tornPieces = Array.from({ length: tornCount }, (_, i): TornItem => {
    const rng = makeRng(seed + i * 3001 + 3000)
    const pos = safePosFromRng(rng)
    return {
      src:      TORN_PAPER_ASSETS[Math.floor(rng() * TORN_PAPER_ASSETS.length)],
      top:      pos.top,
      left:     pos.left,
      width:    75 + rng() * 110,
      rotation: -18 + rng() * 36,
      opacity:  0.48 + rng() * 0.34,
    }
  })

  return { textureUrl, tapes, stickers, decos, tornPieces }
}

export default function RecordSection({
  recordInfo,
  bgmPlaying,
}: {
  recordInfo: RecordInfo
  bgmPlaying: boolean
}) {
  const [deco] = useState<DecoData>(buildDecoData)

  const { jacketUrl, songTitle, songArtist } = recordInfo

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: `url(${deco.textureUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingBottom: '180%',
        boxShadow: '0 4px 16px rgba(0,0,0,0.24), 0 2px 4px rgba(0,0,0,0.14)',
      }}
    >
      {/* ノイズオーバーレイ */}
      <div className="pointer-events-none absolute inset-0" style={{
        backgroundImage: NOISE_SVG, backgroundSize: '200px 200px',
        opacity: 0.045, mixBlendMode: 'multiply', zIndex: 1,
      }} />

      {/* ちぎれ紙 */}
      {deco.tornPieces.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={`torn-${i}`} src={p.src} alt="" loading="lazy"
          style={{
            position: 'absolute', zIndex: 2, height: 'auto', pointerEvents: 'none',
            top: `${p.top}%`, left: `${p.left}%`, width: p.width,
            transform: `rotate(${p.rotation}deg)`, opacity: p.opacity,
          }}
        />
      ))}

      {/* 手書きデコ */}
      {deco.decos.map((d, i) => (
        <div
          key={`deco-${i}`}
          className="pointer-events-none absolute font-caveat select-none"
          style={{
            top: `${d.top}%`, left: `${d.left}%`,
            transform: `rotate(${d.rotation}deg)`,
            fontSize: '13px',
            color: 'rgba(60,40,20,0.40)',
            zIndex: 3, whiteSpace: 'nowrap', lineHeight: 1,
          }}
        >
          {d.text}
        </div>
      ))}

      {/* マスキングテープ */}
      {deco.tapes.map((t, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={`tape-${i}`} src={t.src} alt="" loading="lazy"
          style={{
            position: 'absolute', zIndex: 4, height: 'auto', pointerEvents: 'none',
            top: `${t.top}%`, left: `${t.left}%`, width: t.width,
            transform: `rotate(${t.rotation}deg)`, opacity: 0.88,
          }}
        />
      ))}

      {/* ステッカー */}
      {deco.stickers.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={`stk-${i}`} src={s.src} alt="" loading="lazy"
          style={{
            position: 'absolute', zIndex: 5, height: 'auto', pointerEvents: 'none',
            top: `${s.top}%`, left: `${s.left}%`, width: s.size,
            transform: `rotate(${s.rotation}deg)`, opacity: s.opacity,
          }}
        />
      ))}

      {/* メインコンテンツ（レコード + テキスト） zIndex: 10 で最前面 */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ gap: 20, zIndex: 10, paddingTop: 16, paddingBottom: '44%' }}
      >
        {/* レコード盤 */}
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: [
              'radial-gradient(circle at center,',
              '  transparent 0%,',
              '  transparent 37%,',
              '  #1a1a1a 37%,',
              '  #1a1a1a 39%,',
              '  #2a2a2a 39%,',
              '  #222 55%,',
              '  #1e1e1e 55%,',
              '  #1e1e1e 62%,',
              '  #2a2a2a 62%,',
              '  #222 72%,',
              '  #1a1a1a 72%',
              ')',
            ].join(''),
            boxShadow: [
              'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
              '0 4px 20px rgba(0, 0, 0, 0.3)',
              '0 8px 32px rgba(0,0,0,0.55)',
            ].join(', '),
            animation: 'record-spin 5s linear infinite',
            animationPlayState: bgmPlaying ? 'running' : 'paused',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* 溝（グルーヴ）*/}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: [
              'repeating-radial-gradient(',
              '  circle at center,',
              '  transparent 0px,',
              '  transparent 3px,',
              '  rgba(255, 255, 255, 0.03) 3px,',
              '  rgba(255, 255, 255, 0.03) 4px',
              ')',
            ].join(''),
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {/* ハイライト（反射光）*/}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: [
              'conic-gradient(',
              '  from 0deg,',
              '  transparent 0deg,',
              '  transparent 120deg,',
              '  rgba(255, 255, 255, 0.08) 150deg,',
              '  rgba(255, 255, 255, 0.15) 180deg,',
              '  rgba(255, 255, 255, 0.08) 210deg,',
              '  transparent 240deg,',
              '  transparent 360deg',
              ')',
            ].join(''),
            pointerEvents: 'none',
            zIndex: 1,
          }} />

          {/* ジャケ写（中央埋め込み） */}
          <div style={{
            position: 'absolute',
            width: '38%', height: '38%',
            borderRadius: '50%',
            overflow: 'hidden',
            top: '31%', left: '31%',
            background: '#111',
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.08)',
            zIndex: 2,
          }}>
            {jacketUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={jacketUrl} alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
          </div>

          {/* 中央スピンドル穴 */}
          <div style={{
            position: 'absolute',
            width: 8, height: 8,
            borderRadius: '50%',
            background: '#0a0a0a',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3,
          }} />
        </div>

        {/* テキスト情報 — ダークグラスモーフィズムカード */}
        {(songTitle || songArtist) && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 16,
              padding: '20px 24px',
              textAlign: 'center',
              maxWidth: 280,
              width: '80%',
            }}
          >
            {/* キャプション */}
            <p
              className="font-ui"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.8)',
                letterSpacing: '0.02em',
                marginBottom: 8,
              }}
            >
              これは、あなたを表す一曲。
            </p>
            {/* 曲名 */}
            {songTitle && (
              <p
                className="font-ui"
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.95)',
                  lineHeight: 1.3,
                }}
              >
                {songTitle}
              </p>
            )}
            {/* アーティスト名 */}
            {songArtist && (
              <p
                className="font-ui"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginTop: 6,
                }}
              >
                {songArtist}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ページ下部フェードエッジ */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.1))', zIndex: 20 }} />
    </div>
  )
}
