'use client'

import { makeRng, STICKER_ASSETS, TAPE_ASSETS, TEXTURE_ASSETS, NOISE_SVG } from '@/lib/albumAssets'
import type { RecordInfo } from '@/lib/albumAssets'

// レコードセクション固定シード（毎回同じデコレーション配置）
const SECTION_SEED = 9371

// ステッカーをレコード・テキストエリアを避けた位置に配置
// 上ゾーン: top 0-20% / 下ゾーン: top 78-96% / 左ゾーン: left 0-14% / 右ゾーン: left 85-98%
function buildStickerSlots(count: number) {
  const slots: { top: number; left: number }[] = []
  for (let i = 0; i < count; i++) {
    const sr = makeRng(SECTION_SEED + i * 1337)
    const zone = Math.floor(sr() * 4)
    if (zone === 0) slots.push({ top: 3  + sr() * 17, left: 4  + sr() * 90 })  // 上
    else if (zone === 1) slots.push({ top: 78 + sr() * 17, left: 4  + sr() * 90 })  // 下
    else if (zone === 2) slots.push({ top: 18 + sr() * 58, left: 1  + sr() * 12 })  // 左
    else                 slots.push({ top: 18 + sr() * 58, left: 87 + sr() * 11 })  // 右
  }
  return slots
}

export default function RecordSection({
  recordInfo,
  bgmPlaying,
}: {
  recordInfo: RecordInfo
  bgmPlaying: boolean
}) {
  const rng = makeRng(SECTION_SEED)

  // 背景テクスチャ
  const textureUrl = TEXTURE_ASSETS[Math.floor(rng() * TEXTURE_ASSETS.length)]

  // マスキングテープ（上部中央）
  const tapeIdx = Math.floor(rng() * 20)

  // ステッカー（5〜7 個）
  const stickerCount = 5 + Math.floor(rng() * 3)
  const slots = buildStickerSlots(stickerCount)
  const stickers = slots.map((slot, i) => {
    const sr = makeRng(SECTION_SEED + i * 997)
    return {
      src:      STICKER_ASSETS[Math.floor(sr() * STICKER_ASSETS.length)],
      size:     38 + sr() * 80,
      rotation: -30 + sr() * 60,
      opacity:  0.78 + sr() * 0.22,
      ...slot,
    }
  })

  const { jacketUrl, songTitle, songArtist } = recordInfo

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: `url(${textureUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingBottom: '115%',
        boxShadow: '0 4px 16px rgba(0,0,0,0.24), 0 2px 4px rgba(0,0,0,0.14)',
      }}
    >
      {/* ノイズオーバーレイ */}
      <div className="pointer-events-none absolute inset-0" style={{
        backgroundImage: NOISE_SVG, backgroundSize: '200px 200px',
        opacity: 0.045, mixBlendMode: 'multiply', zIndex: 1,
      }} />

      {/* マスキングテープ */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={TAPE_ASSETS[tapeIdx]} alt="" loading="lazy"
        style={{
          position: 'absolute', zIndex: 12, height: 'auto', pointerEvents: 'none',
          width: 96, top: -14, left: '50%',
          transform: 'translateX(-50%) rotate(-1deg)', opacity: 0.9,
        }}
      />

      {/* ステッカー */}
      {stickers.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={s.src} alt="" loading="lazy"
          style={{
            position: 'absolute', zIndex: 11, height: 'auto', pointerEvents: 'none',
            top: `${s.top}%`, left: `${s.left}%`, width: s.size,
            transform: `rotate(${s.rotation}deg)`, opacity: s.opacity,
          }}
        />
      ))}

      {/* メインコンテンツ（レコード + テキスト） */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ gap: 20, zIndex: 10, paddingTop: 16, paddingBottom: 24 }}
      >
        {/* レコード盤 */}
        <div
          style={{
            width: 220,
            height: 220,
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
              '0 8px 32px rgba(0,0,0,0.55)',
              '0 2px 8px rgba(0,0,0,0.35)',
              'inset 0 2px 4px rgba(255,255,255,0.04)',
            ].join(', '),
            animation: 'record-spin 5s linear infinite',
            animationPlayState: bgmPlaying ? 'running' : 'paused',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* ジャケ写（中央埋め込み） */}
          <div style={{
            position: 'absolute',
            width: '38%', height: '38%',
            borderRadius: '50%',
            overflow: 'hidden',
            top: '31%', left: '31%',
            background: '#111',
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.08)',
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
            zIndex: 1,
          }} />
        </div>

        {/* テキスト情報 */}
        {(songTitle || songArtist) && (
          <div className="text-center px-6" style={{ maxWidth: 300 }}>
            {songTitle && (
              <p
                className="font-display"
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: '#2C2420',
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                  textShadow: '0 1px 2px rgba(0,0,0,0.08)',
                }}
              >
                {songTitle}
              </p>
            )}
            {songArtist && (
              <p
                className="font-ui mt-1"
                style={{ fontSize: 13, color: '#6B5E54', letterSpacing: '0.04em' }}
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
