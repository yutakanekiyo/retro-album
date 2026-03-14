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
  sort_order: number
}

type Props = {
  items: AlbumItem[]
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
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

  // キーボードナビゲーション
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
        <p className="text-sm text-[#8b6340]">写真がまだありません</p>
      </div>
    )
  }

  const item = items[currentIndex]

  // ドットインジケーター用（最大9つ表示）
  const dotStart = Math.max(0, Math.min(currentIndex - 4, items.length - 9))
  const dotItems = items.slice(dotStart, dotStart + 9)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ツールバー */}
      <div className="flex items-center justify-between border-b border-[#8b6340]/20 px-4 py-2">
        <span className="text-xs tabular-nums text-[#8b6340]">
          {currentIndex + 1} / {items.length}
        </span>
        <button
          onClick={() => setViewMode(viewMode === 'slide' ? 'grid' : 'slide')}
          className="text-xs text-[#8b6340] hover:text-[#d4843a] transition-colors tracking-widest"
        >
          {viewMode === 'slide' ? '一覧表示' : '戻る'}
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
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.28 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
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

            {/* 左右ボタン（タブレット・PC用） */}
            {currentIndex > 0 && (
              <button
                onClick={() => navigate(currentIndex - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white text-xl hover:bg-black/70 transition-colors select-none"
              >
                ‹
              </button>
            )}
            {currentIndex < items.length - 1 && (
              <button
                onClick={() => navigate(currentIndex + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white text-xl hover:bg-black/70 transition-colors select-none"
              >
                ›
              </button>
            )}
          </div>

          {/* キャプション */}
          <div className="min-h-[2.5rem] px-6 py-2 text-center">
            {item.caption && (
              <p className="text-sm text-[#f5e6d0]/80 leading-relaxed">{item.caption}</p>
            )}
          </div>

          {/* ドットインジケーター */}
          {items.length > 1 && (
            <div className="flex justify-center gap-1.5 pb-4">
              {dotItems.map((_, i) => {
                const idx = dotStart + i
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(idx)}
                    className={`rounded-full transition-all duration-200 ${
                      idx === currentIndex
                        ? 'h-1.5 w-4 bg-[#d4843a]'
                        : 'h-1.5 w-1.5 bg-[#8b6340]/50'
                    }`}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// 写真スライド（ピンチズーム・ダブルタップズーム対応）
function PhotoSlide({ src, alt }: { src: string; alt: string }) {
  const scale = useMotionValue(1)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const lastScale = useRef(1)
  const lastDistance = useRef<number | null>(null)
  const lastTap = useRef(0)
  const originX = useRef(0)
  const originY = useRef(0)

  function getDistance(touches: React.TouchList) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      lastDistance.current = getDistance(e.touches)
      originX.current = (e.touches[0].clientX + e.touches[1].clientX) / 2
      originY.current = (e.touches[0].clientY + e.touches[1].clientY) / 2
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
    // ズームアウトしきったらリセット
    if (scale.get() < 1.05) {
      animate(scale, 1, { type: 'spring', stiffness: 400, damping: 30 })
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 })
      lastScale.current = 1
    }
  }

  function handleClick(e: React.MouseEvent) {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      // ダブルタップ: ズームトグル
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
      className="absolute inset-0 flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain select-none"
        priority
        sizes="100vw"
        draggable={false}
      />
    </motion.div>
  )
}

// 動画スライド
function VideoSlide({ src }: { src: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <video
        src={src}
        controls
        playsInline
        className="max-h-full max-w-full"
      />
    </div>
  )
}
