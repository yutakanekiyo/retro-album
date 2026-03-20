'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion, useMotionValue, animate } from 'framer-motion'
import Image from 'next/image'
import ThumbnailGrid from './ThumbnailGrid'

export type AlbumItem = {
  id: string
  type: 'photo' | 'video'
  signedUrl: string
  thumbnailUrl: string | null
  caption: string | null
  dateLabel: string | null
  sort_order: number
}

type Props = {
  items: AlbumItem[]
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
    filter: 'brightness(0.6)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'brightness(1)',
  },
  exit: (dir: number) => ({
    x: dir < 0 ? '100%' : '-100%',
    opacity: 0,
    filter: 'brightness(0.6)',
  }),
}

// パーフォレーションストリップ
function PerfStrip() {
  return (
    <div className="perf-strip w-full">
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} className="perf-hole" />
      ))}
    </div>
  )
}

export default function AlbumViewer({ items }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [viewMode, setViewMode] = useState<'slide' | 'grid'>('slide')

  const navigate = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= items.length) return
      setDirection(newIndex > currentIndex ? 1 : -1)
      setCurrentIndex(newIndex)
    },
    [currentIndex, items.length]
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (viewMode !== 'slide') return
      if (e.key === 'ArrowRight') navigate(currentIndex + 1)
      if (e.key === 'ArrowLeft') navigate(currentIndex - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIndex, navigate, viewMode])

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="film-counter">— NO PHOTOS —</p>
      </div>
    )
  }

  const item = items[currentIndex]

  // カウンター表示 "001 / 036"
  const counterStr = `${String(currentIndex + 1).padStart(3, '0')} / ${String(items.length).padStart(3, '0')}`

  // ドットインジケーター（最大9）
  const dotStart = Math.max(0, Math.min(currentIndex - 4, items.length - 9))
  const dotItems = items.slice(dotStart, dotStart + 9)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* 上部パーフォレーション */}
      <PerfStrip />

      {/* ツールバー */}
      <div className="flex items-center justify-between bg-[#0f0a04] px-4 py-1.5">
        <span className="film-counter">{counterStr}</span>
        <button
          onClick={() => setViewMode(viewMode === 'slide' ? 'grid' : 'slide')}
          className="font-elite text-[11px] tracking-[0.2em] text-[#8b6340] hover:text-[#d4843a] transition-colors uppercase"
        >
          {viewMode === 'slide' ? '[ Grid ]' : '[ Film ]'}
        </button>
      </div>

      {viewMode === 'grid' ? (
        <ThumbnailGrid
          items={items}
          currentIndex={currentIndex}
          onSelect={(i) => {
            navigate(i)
            setViewMode('slide')
          }}
        />
      ) : (
        <>
          {/* スライドエリア */}
          <div className="relative flex-1 overflow-hidden bg-black">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) navigate(currentIndex + 1)
                  else if (info.offset.x > 50) navigate(currentIndex - 1)
                }}
                className="absolute inset-0 touch-pan-y cursor-grab active:cursor-grabbing"
              >
                {item.type === 'video' ? (
                  <VideoSlide src={item.signedUrl} />
                ) : (
                  <PhotoSlide src={item.signedUrl} alt={item.caption ?? `Photo ${currentIndex + 1}`} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* 左右ナビ（タブレット・PC） */}
            {currentIndex > 0 && (
              <button
                onClick={() => navigate(currentIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-[#f5e6d0]/70 text-2xl hover:bg-black/60 hover:text-[#f5e6d0] transition-all select-none"
              >
                ‹
              </button>
            )}
            {currentIndex < items.length - 1 && (
              <button
                onClick={() => navigate(currentIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-[#f5e6d0]/70 text-2xl hover:bg-black/60 hover:text-[#f5e6d0] transition-all select-none"
              >
                ›
              </button>
            )}
          </div>

          {/* 下部パーフォレーション */}
          <PerfStrip />

          {/* キャプション・インジケーター */}
          <div className="bg-[#0f0a04] px-4 py-2">
            {/* キャプション（フィルム日付スタンプ風） */}
            <div className="mb-2 min-h-[1.4rem] text-center">
              {item.caption && (
                <p className="film-caption">{item.caption}</p>
              )}
            </div>

            {/* ドットインジケーター */}
            {items.length > 1 && (
              <div className="flex justify-center gap-1.5">
                {dotItems.map((_, i) => {
                  const idx = dotStart + i
                  return (
                    <button
                      key={idx}
                      onClick={() => navigate(idx)}
                      className={`rounded-full transition-all duration-200 ${
                        idx === currentIndex
                          ? 'h-1.5 w-5 bg-[#d4843a]'
                          : 'h-1.5 w-1.5 bg-[#8b6340]/40 hover:bg-[#8b6340]'
                      }`}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// 写真スライド（フィルムフィルター + ピンチ/ダブルタップズーム）
function PhotoSlide({ src, alt }: { src: string; alt: string }) {
  const scale = useMotionValue(1)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const lastScale = useRef(1)
  const lastDistance = useRef<number | null>(null)
  const lastTap = useRef(0)

  function getDistance(touches: React.TouchList) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      lastDistance.current = getDistance(e.touches)
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length !== 2) return
    e.stopPropagation()
    const dist = getDistance(e.touches)
    if (lastDistance.current) {
      const newScale = Math.max(1, Math.min(4, lastScale.current * (dist / lastDistance.current)))
      scale.set(newScale)
    }
    lastDistance.current = dist
  }

  function handleTouchEnd() {
    lastScale.current = scale.get()
    lastDistance.current = null
    if (scale.get() < 1.05) {
      animate(scale, 1, { type: 'spring', stiffness: 400, damping: 30 })
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 })
      lastScale.current = 1
    }
  }

  function handleClick() {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      if (scale.get() > 1) {
        animate(scale, 1, { type: 'spring', stiffness: 400, damping: 30 })
        animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
        animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 })
        lastScale.current = 1
      } else {
        animate(scale, 2.5, { type: 'spring', stiffness: 400, damping: 30 })
        lastScale.current = 2.5
      }
    }
    lastTap.current = now
  }

  return (
    <motion.div
      style={{ scale, x, y }}
      className="absolute inset-0 flex items-center justify-center photo-grain"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain select-none film-filter"
        priority
        sizes="100vw"
        draggable={false}
      />
    </motion.div>
  )
}

// 動画スライド
function VideoSlide({ src }: { src: string }) {
  const [started, setStarted] = useState(false)

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      {/* フィルムグレインオーバーレイ */}
      <div className="pointer-events-none absolute inset-0 z-10 photo-grain" />

      <video
        src={src}
        controls={started}
        playsInline
        className="max-h-full max-w-full"
        style={{ filter: 'sepia(10%) contrast(1.05)' }}
        onPlay={() => setStarted(true)}
      />

      {/* カスタム再生ボタン（再生前） */}
      {!started && (
        <button
          onClick={() => {
            setStarted(true)
            const video = document.querySelector(`video[src="${src}"]`) as HTMLVideoElement
            video?.play()
          }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/20"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d4843a]/70 bg-black/50 text-[#d4843a] shadow-[0_0_20px_rgba(212,132,58,0.3)] transition-transform hover:scale-105">
            <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor">
              <polygon points="0,0 20,11 0,22" />
            </svg>
          </div>
          <span className="font-elite text-[11px] tracking-[0.3em] text-[#d4843a]/80 uppercase">
            Play
          </span>
        </button>
      )}
    </div>
  )
}
