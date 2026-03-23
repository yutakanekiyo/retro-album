'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import type { AlbumItem } from './AlbumViewer'

function VideoPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    ref.current?.play().catch(() => {})
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      controls
      playsInline
      autoPlay
      className="max-h-full max-w-full"
      style={{ filter: 'sepia(8%) contrast(1.05)' }}
    />
  )
}

type Props = {
  items: AlbumItem[]
  initialIndex: number
  onClose: () => void
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 }),
}

export default function FullscreenViewer({ items, initialIndex, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)

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
      if (e.key === 'ArrowRight') navigate(currentIndex + 1)
      if (e.key === 'ArrowLeft') navigate(currentIndex - 1)
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIndex, navigate, onClose])

  const item = items[currentIndex]
  const counterStr = `${String(currentIndex + 1).padStart(3, '0')} / ${String(items.length).padStart(3, '0')}`

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <span className="film-counter">{counterStr}</span>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 text-lg transition-colors hover:bg-white/20 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Slide area */}
      <div className="relative flex-1 overflow-hidden">
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
              if (info.offset.x < -60) navigate(currentIndex + 1)
              else if (info.offset.x > 60) navigate(currentIndex - 1)
            }}
            className="absolute inset-0 flex items-center justify-center touch-pan-y cursor-grab active:cursor-grabbing"
          >
            {item.type === 'video' ? (
              <VideoPlayer src={item.signedUrl} />
            ) : (
              <div className="relative h-full w-full photo-grain">
                <Image
                  src={item.signedUrl}
                  alt={item.caption ?? ''}
                  fill
                  className="object-contain film-filter"
                  sizes="100vw"
                  priority
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Left arrow */}
        {currentIndex > 0 && (
          <button
            onClick={() => navigate(currentIndex - 1)}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl text-white/70 transition-all select-none hover:bg-black/60 hover:text-white"
          >
            ‹
          </button>
        )}

        {/* Right arrow */}
        {currentIndex < items.length - 1 && (
          <button
            onClick={() => navigate(currentIndex + 1)}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl text-white/70 transition-all select-none hover:bg-black/60 hover:text-white"
          >
            ›
          </button>
        )}
      </div>

      {/* Caption */}
      <div className="shrink-0 min-h-[2.5rem] px-4 py-2 text-center">
        {(item.caption || item.dateLabel) && (
          <p className="film-caption">{item.dateLabel ?? item.caption}</p>
        )}
      </div>
    </motion.div>
  )
}
