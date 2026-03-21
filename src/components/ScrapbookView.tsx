'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { AlbumItem } from './AlbumViewer'
import {
  makeRng, shuffleIndices,
  STICKER_ASSETS, TEXT_STICKER_ASSETS, TAPE_ASSETS, TEXTURE_ASSETS, NOISE_SVG,
} from '@/lib/albumAssets'
import type { RecordInfo } from '@/lib/albumAssets'
import RecordSection from './RecordSection'

export type { RecordInfo }

type Props = {
  items: AlbumItem[]
  onPhotoClick: (originalIndex: number) => void
  recordInfo?: RecordInfo | null
  bgmPlaying?: boolean
}
// p9・p10 が欠番のため除外
const TORN_PAPER_ASSETS = [1,2,3,4,5,6,7,8,11,12,13].map(n => `/assets/torn-paper/p${n}.png`)

// 写真フィルター
const PHOTO_FILTERS = [
  'sepia(0.18) saturate(0.88)',
  'brightness(1.06) contrast(0.88) saturate(0.78)',
  'contrast(1.14) saturate(1.08) brightness(0.94)',
  'sepia(0.12) saturate(1.18) hue-rotate(-5deg)',
  'sepia(0.28) contrast(1.06) saturate(0.82) brightness(0.96)',
]

// 手書きデコテキスト
const DECO_TEXTS = [
  'memories ♡', 'good times', 'best day ever', 'forever', 'summer',
  '最高！', '笑', 'また行こう', '忘れない', 'LOVE', '思い出',
  'precious', 'always', 'cheers ♡', 'happy days', '✦ ✦',
  'wild & free', '感謝', 'together', '→',
]

// ─── 切り抜き文字 ─────────────────────────────────────────────────────────────
const CUTOUT_FONTS  = ['Georgia,serif', '"Times New Roman",serif', '"Courier New",monospace', 'Impact,sans-serif', '"Arial Black",sans-serif']
const CUTOUT_COLORS = ['#2c2c2c', '#8b0000', '#003366', '#2d4a22', '#4a3728']
const CUTOUT_BGS    = ['#f5f0e0', '#e8d5d5', '#d5dce8', '#dce8d5', 'transparent', 'transparent']

function CutoutText({ text, seed }: { text: string; seed: number }) {
  const chars = text.split('')
  const styles = chars.map((_, i) => {
    const rng = makeRng(seed + i * 31)
    return {
      fontFamily:      CUTOUT_FONTS[Math.floor(rng() * CUTOUT_FONTS.length)],
      fontSize:        `${16 + rng() * 14}px`,
      fontWeight:      rng() > 0.5 ? 'bold' : 'normal',
      color:           CUTOUT_COLORS[Math.floor(rng() * CUTOUT_COLORS.length)],
      backgroundColor: CUTOUT_BGS[Math.floor(rng() * CUTOUT_BGS.length)],
      padding:         '1px 3px',
      transform:       `rotate(${(rng() - 0.5) * 8}deg)`,
      display:         'inline-block' as const,
      lineHeight:      1,
      border:          rng() > 0.72 ? '1px solid #ccc' : 'none',
    }
  })
  return (
    <div className="pointer-events-none absolute flex items-end gap-px" style={{ zIndex: 6 }}>
      {chars.map((char, i) => (
        <span key={i} style={styles[i]}>{char}</span>
      ))}
    </div>
  )
}

function HandwrittenDeco({ text, top, left, rotation, isDark }: {
  text: string; top: number; left: number; rotation: number; isDark: boolean
}) {
  return (
    <div
      className="pointer-events-none absolute font-caveat select-none"
      style={{
        top: `${top}%`, left: `${left}%`,
        transform: `rotate(${rotation}deg)`,
        fontSize: '13px',
        color: isDark ? 'rgba(220,200,170,0.55)' : 'rgba(60,40,20,0.40)',
        zIndex: 5, whiteSpace: 'nowrap', lineHeight: 1,
      }}
    >
      {text}
    </div>
  )
}

// ─── レイアウトパターン ────────────────────────────────────────────────────────
type PhotoPos = {
  topPct: number; leftPct: number; widthPct: number
  aspect: string; rotation: number; zIndex: number
}

const LAYOUT_PATTERNS: PhotoPos[][] = [
  // A: Hero + 4 scattered
  [
    { topPct: 5,  leftPct: 2,  widthPct: 55, aspect: '4/3',  rotation: -2, zIndex: 2 },
    { topPct: 3,  leftPct: 60, widthPct: 36, aspect: '3/4',  rotation:  4, zIndex: 1 },
    { topPct: 37, leftPct: 60, widthPct: 37, aspect: '4/3',  rotation: -1, zIndex: 1 },
    { topPct: 63, leftPct: 40, widthPct: 55, aspect: '4/3',  rotation:  2, zIndex: 2 },
    { topPct: 60, leftPct: 2,  widthPct: 36, aspect: '3/4',  rotation: -4, zIndex: 1 },
  ],
  // B: 2×3 grid chaos
  [
    { topPct: 2,  leftPct: 2,  widthPct: 47, aspect: '4/3',  rotation: -2, zIndex: 1 },
    { topPct: 4,  leftPct: 52, widthPct: 46, aspect: '4/3',  rotation:  3, zIndex: 1 },
    { topPct: 36, leftPct: 2,  widthPct: 45, aspect: '4/3',  rotation:  2, zIndex: 1 },
    { topPct: 34, leftPct: 53, widthPct: 45, aspect: '4/3',  rotation: -3, zIndex: 1 },
    { topPct: 68, leftPct: 2,  widthPct: 47, aspect: '4/3',  rotation: -1, zIndex: 1 },
    { topPct: 70, leftPct: 52, widthPct: 44, aspect: '4/3',  rotation:  2, zIndex: 1 },
  ],
  // C: Central + corners
  [
    { topPct: 25, leftPct: 8,  widthPct: 84, aspect: '4/3',  rotation: -1, zIndex: 3 },
    { topPct: 2,  leftPct: 2,  widthPct: 32, aspect: '4/3',  rotation:  6, zIndex: 2 },
    { topPct: 2,  leftPct: 66, widthPct: 32, aspect: '4/3',  rotation: -5, zIndex: 2 },
    { topPct: 70, leftPct: 2,  widthPct: 32, aspect: '4/3',  rotation: -4, zIndex: 2 },
    { topPct: 70, leftPct: 66, widthPct: 32, aspect: '4/3',  rotation:  5, zIndex: 2 },
  ],
  // D: Diagonal cascade
  [
    { topPct: 2,  leftPct: 2,  widthPct: 44, aspect: '4/3',  rotation: -3, zIndex: 1 },
    { topPct: 8,  leftPct: 50, widthPct: 48, aspect: '4/3',  rotation:  2, zIndex: 2 },
    { topPct: 30, leftPct: 3,  widthPct: 42, aspect: '3/4',  rotation:  4, zIndex: 3 },
    { topPct: 36, leftPct: 46, widthPct: 50, aspect: '4/3',  rotation: -2, zIndex: 2 },
    { topPct: 63, leftPct: 2,  widthPct: 54, aspect: '4/3',  rotation:  1, zIndex: 1 },
    { topPct: 66, leftPct: 52, widthPct: 46, aspect: '4/3',  rotation: -3, zIndex: 2 },
  ],
  // E: 2×2 + wide banner
  [
    { topPct: 2,  leftPct: 2,  widthPct: 47, aspect: '4/3',  rotation: -1, zIndex: 1 },
    { topPct: 3,  leftPct: 52, widthPct: 46, aspect: '4/3',  rotation:  2, zIndex: 1 },
    { topPct: 36, leftPct: 2,  widthPct: 47, aspect: '4/3',  rotation:  2, zIndex: 1 },
    { topPct: 35, leftPct: 52, widthPct: 46, aspect: '4/3',  rotation: -2, zIndex: 1 },
    { topPct: 70, leftPct: 6,  widthPct: 88, aspect: '16/9', rotation:  0, zIndex: 2 },
  ],
  // F: Overlapping scatter
  [
    { topPct: 3,  leftPct: 2,  widthPct: 54, aspect: '4/3',  rotation: -5, zIndex: 1 },
    { topPct: 2,  leftPct: 38, widthPct: 56, aspect: '4/3',  rotation:  4, zIndex: 2 },
    { topPct: 34, leftPct: 5,  widthPct: 52, aspect: '4/3',  rotation:  3, zIndex: 3 },
    { topPct: 36, leftPct: 40, widthPct: 54, aspect: '4/3',  rotation: -3, zIndex: 2 },
    { topPct: 67, leftPct: 10, widthPct: 78, aspect: '16/9', rotation:  1, zIndex: 4 },
  ],
]

// ─── ページデータ ─────────────────────────────────────────────────────────────
interface StickerEntry { src: string; isText: boolean }
interface PageData {
  photos: Array<AlbumItem & { originalIndex: number }>
  patternIndex: number
  textureUrl: string
  isDark: boolean
  seed: number
  stickers: StickerEntry[]
}

function buildPages(items: AlbumItem[], masterSeed: number): PageData[] {
  const rng = makeRng(masterSeed)

  // シャッフル
  const shuffled = items.map((item, i) => ({ ...item, originalIndex: i }))
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const pages: PageData[] = []
  let offset = 0
  let pi = 0
  let lastBgIdx = -1

  while (offset < shuffled.length) {
    const pr = makeRng(masterSeed + pi * 7919)
    const count = Math.min(5 + Math.floor(pr() * 3), shuffled.length - offset)

    // 1. 背景テクスチャ（連続同一テクスチャ回避）
    let bgIdx = Math.floor(pr() * TEXTURE_ASSETS.length)
    if (bgIdx === lastBgIdx && TEXTURE_ASSETS.length > 1) {
      bgIdx = (bgIdx + 1) % TEXTURE_ASSETS.length
    }
    lastBgIdx = bgIdx

    // 3. ステッカー選出（重複なし、テキストステッカーは 0-2 個に制限）
    const stickerTotal = 4 + Math.floor(pr() * 5)  // 4-8個
    const textCount    = Math.floor(pr() * 3)        // 0-2個
    const regCount     = stickerTotal - textCount

    const regIndices  = shuffleIndices(47, makeRng(masterSeed + pi * 5003)).slice(0, regCount)
    const textIndices = shuffleIndices(14, makeRng(masterSeed + pi * 6007)).slice(0, textCount)

    const stickers: StickerEntry[] = [
      ...regIndices.map(idx => ({ src: STICKER_ASSETS[idx],      isText: false })),
      ...textIndices.map(idx => ({ src: TEXT_STICKER_ASSETS[idx], isText: true  })),
    ]

    pages.push({
      photos: shuffled.slice(offset, offset + count),
      patternIndex: Math.floor(pr() * LAYOUT_PATTERNS.length),
      textureUrl: TEXTURE_ASSETS[bgIdx],
      isDark: false,  // 実際のテクスチャを見て調整してください
      seed: masterSeed + pi,
      stickers,
    })

    offset += count
    pi++
  }
  return pages
}

// ─── 2. マスキングテープ（PNG版）────────────────────────────────────────────
type TapePlacement = 'top-center' | 'corner-tl' | 'corner-tr' | 'x-corners' | 'side'

function MaskingTapePng({ seed, photoIdx }: { seed: number; photoIdx: number }) {
  const rng = makeRng(seed + photoIdx * 113)
  const tapeIdx   = Math.floor(rng() * 20)
  const placement = (['top-center','corner-tl','corner-tr','x-corners','side'] as TapePlacement[])[Math.floor(rng() * 5)]
  const w         = Math.round((80 + rng() * 55) * (0.72 + rng() * 0.36))  // 58-136px
  const angle     = -25 + rng() * 50
  const src       = TAPE_ASSETS[tapeIdx]
  const src2      = TAPE_ASSETS[(tapeIdx + 7) % 20]

  const imgStyle: React.CSSProperties = {
    position: 'absolute', zIndex: 10, height: 'auto',
    width: w, opacity: 0.92, pointerEvents: 'none',
  }

  switch (placement) {
    case 'top-center':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" style={{ ...imgStyle, top: -14, left: '50%', transform: `translateX(-50%) rotate(${angle}deg)` }} />
      )
    case 'corner-tl':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" style={{ ...imgStyle, width: w - 16, top: -10, left: -12, transform: `rotate(${42 + angle * 0.3}deg)` }} />
      )
    case 'corner-tr':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" style={{ ...imgStyle, width: w - 16, top: -10, right: -12, transform: `rotate(${-42 + angle * 0.3}deg)` }} />
      )
    case 'x-corners':
      return (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src}  alt="" loading="lazy" style={{ ...imgStyle, width: w - 20, top: -10, left:  -12, transform: 'rotate(43deg)' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src2} alt="" loading="lazy" style={{ ...imgStyle, width: w - 20, top: -10, right: -12, transform: 'rotate(-43deg)' }} />
        </>
      )
    case 'side':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" style={{ ...imgStyle, width: w - 10, top: '18%', left: -16, transform: `rotate(${90 + angle * 0.4}deg)` }} />
      )
  }
}

// ─── 写真カード ───────────────────────────────────────────────────────────────
function PhotoCard({
  item, pos, seed, photoIdx, onClick, priority,
}: {
  item: AlbumItem & { originalIndex: number }
  pos: PhotoPos; seed: number; photoIdx: number; onClick: () => void; priority?: boolean
}) {
  const rng = makeRng(seed + photoIdx * 97)

  const jTop        = pos.topPct  + (rng() - 0.5) * 3
  const jLeft       = pos.leftPct + (rng() - 0.5) * 3
  const jRot        = pos.rotation + (rng() - 0.5) * 3
  const isPolaroid  = rng() < 0.45
  const hasTape     = rng() < 0.68
  const hasCurl     = rng() < 0.22
  const hasVignette = rng() < 0.30
  const photoFilter = PHOTO_FILTERS[Math.floor(rng() * PHOTO_FILTERS.length)]
  const shadowType  = Math.floor(rng() * 3)
  // 6a. ちぎれた紙（写真の下）
  const hasTornUnder   = rng() < 0.38
  const tornUnderIdx   = Math.floor(rng() * TORN_PAPER_ASSETS.length)
  const tornUnderRot   = -6 + rng() * 12
  const tornUnderScale = 0.88 + rng() * 0.38
  // 6c. ちぎれた紙（写真の端を覆う）
  const hasTornOver  = rng() < 0.12
  const tornOverIdx  = Math.floor(rng() * TORN_PAPER_ASSETS.length)
  const tornOverSide = rng() < 0.5 ? 'bottom' : 'right'
  const tornOverRot  = (rng() - 0.5) * 8

  const boxShadow = shadowType === 0
    ? '2px 4px 10px rgba(0,0,0,0.22), 0 1px 3px rgba(0,0,0,0.12)'
    : shadowType === 1
    ? '4px 6px 18px rgba(0,0,0,0.28), 0 2px 5px rgba(0,0,0,0.14)'
    : '1px 2px 6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.10)'
  const labelText = item.dateLabel ?? item.caption

  return (
    <motion.div
      className="absolute cursor-pointer touch-manipulation select-none"
      style={{
        top: `${jTop}%`, left: `${jLeft}%`, width: `${pos.widthPct}%`,
        zIndex: pos.zIndex, transform: `rotate(${jRot}deg)`, transformOrigin: 'center center',
      }}
      initial={{ opacity: 0, scale: 0.93, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: photoIdx * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {/* 6a. ちぎれた紙（写真の下） Pattern A */}
      {hasTornUnder && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={TORN_PAPER_ASSETS[tornUnderIdx]} alt="" loading="lazy"
          style={{
            position: 'absolute', zIndex: -1, height: 'auto', pointerEvents: 'none',
            width: `${Math.round(100 * tornUnderScale)}%`,
            left: `${-Math.round(50 * (tornUnderScale - 1))}%`,
            top: '-8%',
            transform: `rotate(${tornUnderRot}deg)`,
            opacity: 0.72,
          }}
        />
      )}

      {/* curl shadow */}
      {hasCurl && (
        <div className="pointer-events-none absolute" style={{
          bottom: 4, right: 4, width: '45%', height: 20,
          boxShadow: '7px 7px 12px rgba(0,0,0,0.18)',
          transform: 'rotate(3deg)', zIndex: -1,
        }} />
      )}

      {/* 2. マスキングテープ（PNG） */}
      {hasTape && <MaskingTapePng seed={seed} photoIdx={photoIdx} />}

      {/* ポラロイド or プレーン */}
      {isPolaroid ? (
        <div style={{
          backgroundColor: '#f6f0e8', padding: '6px 6px 26px 6px',
          boxShadow: '3px 5px 16px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.14)',
        }}>
          <div className="relative overflow-hidden" style={{ aspectRatio: pos.aspect }}>
            <Image src={item.thumbnailUrl ?? item.signedUrl} alt={labelText ?? ''} fill
              className="object-cover" style={{ filter: photoFilter }}
              sizes="(max-width: 480px) 60vw, 280px"
              priority={priority} />
            {hasVignette && (
              <div className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.3) 100%)' }} />
            )}
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/22">
                <span className="text-white text-lg drop-shadow">▶</span>
              </div>
            )}
          </div>
          <p className="font-caveat mt-1.5 text-center leading-tight text-[#3a2a1a]" style={{ fontSize: '12px' }}>
            {labelText ?? '\u00A0'}
          </p>
        </div>
      ) : (
        <div className="relative overflow-hidden" style={{ aspectRatio: pos.aspect, boxShadow }}>
          <Image src={item.thumbnailUrl ?? item.signedUrl} alt={labelText ?? ''} fill
            className="object-cover" style={{ filter: photoFilter }}
            sizes="(max-width: 480px) 60vw, 280px"
            priority={priority} />
          {hasVignette && (
            <div className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.3) 100%)' }} />
          )}
          {item.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/22">
              <span className="text-white text-lg drop-shadow">▶</span>
            </div>
          )}
          {labelText && (
            <div className="absolute inset-x-0 bottom-0 bg-black/40 px-1.5 py-0.5">
              <p className="font-caveat text-center text-white" style={{ fontSize: '11px' }}>{labelText}</p>
            </div>
          )}
        </div>
      )}

      {/* 6c. ちぎれた紙（写真の端を覆う） Pattern C */}
      {hasTornOver && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={TORN_PAPER_ASSETS[tornOverIdx]} alt="" loading="lazy"
          style={{
            position: 'absolute', zIndex: -1, height: 'auto', pointerEvents: 'none',
            width: tornOverSide === 'bottom' ? '110%' : '55%',
            left: tornOverSide === 'bottom' ? '-5%' : undefined,
            right: tornOverSide === 'right' ? '-8%' : undefined,
            bottom: tornOverSide === 'bottom' ? '-12%' : '15%',
            transform: `rotate(${tornOverSide === 'bottom' ? tornOverRot : 90 + tornOverRot}deg)`,
            opacity: 0.68,
          }}
        />
      )}
    </motion.div>
  )
}

// ─── 写真センター回避ロジック ──────────────────────────────────────────────────
// ページの高さは paddingBottom: 140% → height = 1.4 * width
// topPct は height% 基準、leftPct は width% 基準
function buildPhotoCenters(positions: PhotoPos[]) {
  return positions.map((pos) => {
    const [aw, ah] = pos.aspect.split('/').map(Number)
    // 写真の高さを page-height% に換算
    const photoH = pos.widthPct * (ah / aw) / 1.4
    return {
      cx: pos.leftPct + pos.widthPct / 2,   // width% 基準
      cy: pos.topPct  + photoH / 2,          // height% 基準
      // 回避ゾーン = 写真の中央 60% 領域
      hw: pos.widthPct * 0.30,
      hh: photoH       * 0.30,
    }
  })
}

function isInPhotoCenterZone(
  top: number, left: number,
  centers: { cx: number; cy: number; hw: number; hh: number }[]
): boolean {
  return centers.some(
    (c) => Math.abs(left - c.cx) < c.hw && Math.abs(top - c.cy) < c.hh
  )
}

// ─── スクラップブックページ ───────────────────────────────────────────────────
function ScrapbookPageSection({
  page, onPhotoClick, isFirstPage,
}: {
  page: PageData
  onPhotoClick: (index: number) => void
  isFirstPage?: boolean
}) {
  const pattern   = LAYOUT_PATTERNS[page.patternIndex]
  const positions = pattern.slice(0, page.photos.length)
  const pr = makeRng(page.seed + 1001)

  // 写真センター位置（ステッカー回避用）
  const photoCenters = buildPhotoCenters(positions)

  // 5. ステッカー配置パラメータ（写真の中心を回避）
  const stickerPlacements = page.stickers.map((s, i) => {
    const sr   = makeRng(page.seed + i * 1337)
    const size = s.isText ? (60 + sr() * 140) : (40 + sr() * 160)
    const rotation = -30 + sr() * 60
    const opacity  = 0.82 + sr() * 0.18

    // 最大10回試行して写真中心を避ける位置を探す
    let top  = 4 + sr() * 88
    let left = 3 + sr() * 90
    for (let attempt = 0; attempt < 10; attempt++) {
      const candTop  = 4 + sr() * 88
      const candLeft = 3 + sr() * 90
      if (!isInPhotoCenterZone(candTop, candLeft, photoCenters)) {
        top  = candTop
        left = candLeft
        break
      }
    }

    return { ...s, size, top, left, rotation, opacity }
  })

  // 手書きデコ（1-2個）
  const decoCount = 1 + Math.floor(pr() * 2)
  const decos = Array.from({ length: decoCount }, (_, i) => {
    const dr = makeRng(page.seed + i * 2003)
    return {
      text:     DECO_TEXTS[Math.floor(dr() * DECO_TEXTS.length)],
      top:      8  + dr() * 80,
      left:     4  + dr() * 82,
      rotation: -8 + dr() * 16,
    }
  })

  // 切り抜き文字（35%の確率）
  const hasCutout   = pr() < 0.35
  const cutoutTexts = ['MEMORIES', 'GOOD TIMES', 'BEST DAYS', 'FOREVER']
  const cutoutText  = cutoutTexts[Math.floor(pr() * cutoutTexts.length)]
  const cutoutTop   = 44 + pr() * 12
  const cutoutLeft  = 4  + pr() * 20

  // 6b. 独立ちぎれ紙（Pattern B: 0-2枚）
  const tornBCount  = Math.floor(pr() * 3)
  const tornBPieces = Array.from({ length: tornBCount }, (_, i) => {
    const tr = makeRng(page.seed + i * 3001)
    return {
      src:      TORN_PAPER_ASSETS[Math.floor(tr() * TORN_PAPER_ASSETS.length)],
      top:      18 + tr() * 56,
      left:     4  + tr() * 84,
      width:    80 + tr() * 80,
      rotation: -15 + tr() * 30,
      opacity:  0.52 + tr() * 0.28,
    }
  })

  return (
    <div
      data-page
      data-seed={page.seed}
      className="relative w-full overflow-hidden"
      style={{
        // 1. 背景テクスチャ（PNG素材）
        backgroundImage: `url(${page.textureUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingBottom: '140%',
        boxShadow: '0 4px 16px rgba(0,0,0,0.24), 0 2px 4px rgba(0,0,0,0.14)',
      }}
    >
      {/* ノイズオーバーレイ（写真感・紙感を加える） */}
      <div className="pointer-events-none absolute inset-0" style={{
        backgroundImage: NOISE_SVG, backgroundSize: '200px 200px',
        opacity: 0.045, mixBlendMode: 'multiply', zIndex: 1,
      }} />

      {/* 6b. 独立ちぎれ紙 */}
      {tornBPieces.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={`tp-b-${i}`} src={p.src} alt="" loading="lazy"
          style={{
            position: 'absolute', zIndex: 0, height: 'auto', pointerEvents: 'none',
            top: `${p.top}%`, left: `${p.left}%`, width: p.width,
            transform: `rotate(${p.rotation}deg)`, opacity: p.opacity,
          }}
        />
      ))}

      {/* 手書きデコ */}
      {decos.map((d, i) => (
        <HandwrittenDeco key={i} text={d.text} top={d.top} left={d.left}
          rotation={d.rotation} isDark={page.isDark} />
      ))}

      {/* 切り抜き文字 */}
      {hasCutout && (
        <div className="pointer-events-none absolute"
          style={{ top: `${cutoutTop}%`, left: `${cutoutLeft}%`, zIndex: 6 }}>
          <CutoutText text={cutoutText} seed={page.seed + 9999} />
        </div>
      )}

      {/* 写真カード */}
      {page.photos.map((photo, idx) => (
        <PhotoCard
          key={photo.id} item={photo}
          pos={positions[idx] ?? positions[positions.length - 1]}
          seed={page.seed} photoIdx={idx}
          onClick={() => onPhotoClick(photo.originalIndex)}
          priority={isFirstPage}
        />
      ))}

      {/* tap photo（最初のページのみ・最初の写真の右上に指が重なるよう配置） */}
      {isFirstPage && positions[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/assets/tap-photo.png" alt="" loading="eager"
          style={{
            position: 'absolute', height: 'auto', pointerEvents: 'none',
            width: 300,
            top: `${positions[0].topPct + 6}%`,
            left: `${positions[0].leftPct + positions[0].widthPct * 0.55}%`,
            transform: 'rotate(8deg)',
            zIndex: 12,
            opacity: 0.92,
          }}
        />
      )}

      {/* 5. ステッカー（150px超は写真の背面、それ以下は前面） */}
      {stickerPlacements.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={`stk-${i}`} src={s.src} alt="" loading="lazy"
          style={{
            position: 'absolute', zIndex: s.size > 150 ? 0 : 11, height: 'auto', pointerEvents: 'none',
            top: `${s.top}%`, left: `${s.left}%`, width: s.size,
            transform: `rotate(${s.rotation}deg)`, opacity: s.opacity,
          }}
        />
      ))}

      {/* ページ下部フェードエッジ */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.1))', zIndex: 20 }} />
    </div>
  )
}

// ─── 無限スクロール ───────────────────────────────────────────────────────────
// DOM に保持するページ数の上限。50枚×ループ程度なら 30 で十分。
const MAX_PAGES = 30

// placeholderHeight: 破棄済みページ群の実測高さ合計（spacer として使う）
type ScrapState = { pages: PageData[]; placeholderHeight: number }

// ─── メインエクスポート ───────────────────────────────────────────────────────
export default function ScrapbookView({ items, onPhotoClick, recordInfo, bgmPlaying = false }: Props) {
  const scrollRef      = useRef<HTMLDivElement>(null)
  const nextSeedRef    = useRef(0)
  const loadingRef     = useRef(false)
  // seed → 実測高さ (px) のマップ。破棄前に記録して spacer に使う。
  const pageHeightsRef = useRef<Map<number, number>>(new Map())

  const [ready, setReady] = useState(false)
  const [scrap, setScrap] = useState<ScrapState>({ pages: [], placeholderHeight: 0 })

  // 初期化
  useEffect(() => {
    if (items.length === 0) return
    const seed = (Math.random() * 1e9) | 0
    nextSeedRef.current = seed + 1_000_003
    setScrap({ pages: buildPages(items, seed), placeholderHeight: 0 })
    setReady(true)
  }, [items])

  // ロードフラグをページ更新後にリセット
  useEffect(() => {
    loadingRef.current = false
  }, [scrap.pages])

  // レンダー後、各ページの実測高さを記録する（破棄前に必要）
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.querySelectorAll<HTMLElement>('[data-seed]').forEach((el) => {
      const seed = Number(el.dataset.seed)
      if (!isNaN(seed) && !pageHeightsRef.current.has(seed)) {
        const h = el.getBoundingClientRect().height
        if (h > 0) pageHeightsRef.current.set(seed, h)
      }
    })
  })

  // スクロールで下端に近づいたら次バッチ追加、MAX_PAGES 超過分は古いページから破棄
  useEffect(() => {
    if (!ready) return
    const root = scrollRef.current
    if (!root) return

    const onScroll = () => {
      if (loadingRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = root
      // 残り 1200px 以下になったら次バッチをロード
      if (scrollHeight - scrollTop - clientHeight > 1200) return

      loadingRef.current = true
      const seed = nextSeedRef.current
      nextSeedRef.current += 1_000_003

      setScrap(prev => {
        const next = [...prev.pages, ...buildPages(items, seed)]
        if (next.length <= MAX_PAGES) return { ...prev, pages: next }

        // MAX_PAGES を超えた分だけ先頭から破棄。
        // 破棄するページの実測高さを合計して placeholderHeight に加算。
        const toRemove  = next.length - MAX_PAGES
        const removed   = next.slice(0, toRemove)
        const addedH    = removed.reduce(
          (sum, p) => sum + (pageHeightsRef.current.get(p.seed) ?? 0),
          0,
        )

        return {
          pages:             next.slice(toRemove),
          placeholderHeight: prev.placeholderHeight + addedH,
        }
      })
    }

    root.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // マウント直後にもチェック（コンテンツが短い場合）
    return () => root.removeEventListener('scroll', onScroll)
  }, [ready, items])

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="film-counter">— NO PHOTOS —</p>
      </div>
    )
  }

  if (!ready) return <div className="flex-1" />

  const { pages, placeholderHeight } = scrap

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto scrollbar-none"
      style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      <div className="mx-auto max-w-md">
        {/* レコードセクション（先頭固定・スクロールで流れる） */}
        {recordInfo && (recordInfo.jacketUrl || recordInfo.songTitle || recordInfo.songArtist) && (
          <div className="relative">
            <RecordSection recordInfo={recordInfo} bgmPlaying={bgmPlaying} />
            {/* SCROLL DOWN: overflow:hidden の外に出してセクションをまたいで表示 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/scroll.png" alt="" loading="lazy"
              style={{
                position: 'absolute', height: 'auto', pointerEvents: 'none',
                width: 300, bottom: -140, left: '50%',
                transform: 'translateX(-50%) rotate(-3deg)',
                opacity: 0.88, zIndex: 30,
              }}
            />
          </div>
        )}
        {placeholderHeight > 0 && (
          <div style={{ height: placeholderHeight }} aria-hidden="true" />
        )}
        {pages.map((page, idx) => (
          <ScrapbookPageSection
            key={page.seed}
            page={page}
            onPhotoClick={onPhotoClick}
            isFirstPage={idx === 0 && placeholderHeight === 0}
          />
        ))}
        <div className="h-16" />
      </div>
    </div>
  )
}
