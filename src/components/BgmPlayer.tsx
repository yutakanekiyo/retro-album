'use client'

import { useState, useRef, useEffect } from 'react'

type Props = {
  src: string
}

export default function BgmPlayer({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  // iOS Safari: ユーザー操作後にのみ再生できる
  const [userInteracted, setUserInteracted] = useState(false)

  // ページ上の最初のインタラクションで自動再生を試みる
  useEffect(() => {
    function onFirstInteraction() {
      if (userInteracted) return
      setUserInteracted(true)
      const audio = audioRef.current
      if (!audio) return
      audio.play().then(() => setPlaying(true)).catch(() => {/* blocked */})
      window.removeEventListener('touchstart', onFirstInteraction)
      window.removeEventListener('click', onFirstInteraction)
    }
    window.addEventListener('touchstart', onFirstInteraction, { once: true, passive: true })
    window.addEventListener('click', onFirstInteraction, { once: true })
    return () => {
      window.removeEventListener('touchstart', onFirstInteraction)
      window.removeEventListener('click', onFirstInteraction)
    }
  }, [userInteracted])

  async function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      try {
        await audio.play()
        setPlaying(true)
      } catch {
        // autoplay blocked
      }
    }
  }

  function toggleMute() {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !muted
    setMuted((m) => !m)
  }

  return (
    <>
      {/* 非表示の audio 要素（loop + preload="none" でiOS節約） */}
      <audio ref={audioRef} src={src} loop preload="none" />

      {/* プレーヤーUI */}
      <div className="flex items-center gap-1">
        {/* 再生/停止 */}
        <button
          onClick={togglePlay}
          title={playing ? '一時停止' : '再生'}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#8b6340]/30 text-[#8b6340] hover:border-[#d4843a] hover:text-[#d4843a] transition-colors"
        >
          {playing ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}
        </button>

        {/* ミュート */}
        <button
          onClick={toggleMute}
          title={muted ? 'ミュート解除' : 'ミュート'}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#8b6340]/30 text-[#8b6340] hover:border-[#d4843a] hover:text-[#d4843a] transition-colors"
        >
          {muted ? <MuteIcon /> : <VolumeIcon />}
        </button>

        {/* 再生中インジケーター */}
        {playing && !muted && (
          <div className="flex items-end gap-[2px] h-4">
            <Bar delay="0s" />
            <Bar delay="0.2s" />
            <Bar delay="0.1s" />
          </div>
        )}
      </div>
    </>
  )
}

function Bar({ delay }: { delay: string }) {
  return (
    <div
      className="w-[3px] rounded-sm bg-[#d4843a] animate-[equalizer_0.6s_ease-in-out_infinite_alternate]"
      style={{ animationDelay: delay, height: '8px' }}
    />
  )
}

function PlayIcon() {
  return (
    <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
      <polygon points="0,0 10,5.5 0,11" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="10" height="11" viewBox="0 0 10 11" fill="currentColor">
      <rect x="0" y="0" width="3.5" height="11" />
      <rect x="6.5" y="0" width="3.5" height="11" />
    </svg>
  )
}

function VolumeIcon() {
  return (
    <svg width="12" height="11" viewBox="0 0 12 11" fill="currentColor">
      <polygon points="0,3 4,3 7,0 7,11 4,8 0,8" />
      <path d="M8.5 2.5 Q11 5.5 8.5 8.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  )
}

function MuteIcon() {
  return (
    <svg width="12" height="11" viewBox="0 0 12 11" fill="currentColor">
      <polygon points="0,3 4,3 7,0 7,11 4,8 0,8" />
      <line x1="9" y1="3" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="8" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
