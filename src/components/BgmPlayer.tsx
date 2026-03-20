'use client'

import { useState, useRef, useEffect } from 'react'

type Props = {
  src: string
  isDark?: boolean
  onPlayingChange?: (isPlaying: boolean) => void
}

function MusicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13 1.5v7.3a2.5 2.5 0 1 1-1.5-2.3V4.5L6 5.8v5.2a2.5 2.5 0 1 1-1.5-2.3V3.2L13 1.5z" />
    </svg>
  )
}

export default function BgmPlayer({ src, isDark = false, onPlayingChange }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)

  function updatePlaying(next: boolean) {
    setPlaying(next)
    onPlayingChange?.(next)
  }

  // iOS Safari: ユーザー操作後にのみ再生できる
  useEffect(() => {
    function onFirstInteraction() {
      if (userInteracted) return
      setUserInteracted(true)
      const audio = audioRef.current
      if (!audio) return
      audio.play().then(() => updatePlaying(true)).catch(() => {/* blocked */})
      window.removeEventListener('touchstart', onFirstInteraction)
      window.removeEventListener('click', onFirstInteraction)
    }
    window.addEventListener('touchstart', onFirstInteraction, { once: true, passive: true })
    window.addEventListener('click', onFirstInteraction, { once: true })
    return () => {
      window.removeEventListener('touchstart', onFirstInteraction)
      window.removeEventListener('click', onFirstInteraction)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInteracted])

  async function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      updatePlaying(false)
    } else {
      try {
        await audio.play()
        updatePlaying(true)
      } catch {
        // autoplay blocked
      }
    }
  }

  return (
    <>
      {/* 非表示の audio 要素 */}
      <audio ref={audioRef} src={src} loop preload="auto" />

      <button
        onClick={togglePlay}
        title={playing ? '一時停止' : '再生'}
        className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm border transition-colors ${playing ? 'bgm-playing' : ''}`}
        style={{
          background: isDark ? 'rgba(44,36,32,0.6)' : 'rgba(255,255,255,0.7)',
          color: isDark ? '#F0EBE3' : '#000000',
          borderColor: isDark ? '#3D3530' : '#E5E5EA',
          opacity: playing ? 1 : 0.45,
        }}
      >
        <MusicIcon />
      </button>
    </>
  )
}
