'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'

export interface BgmPlayerHandle {
  toggle: () => void
}

type Props = {
  src: string
  onPlayingChange?: (isPlaying: boolean) => void
}

const BgmPlayer = forwardRef<BgmPlayerHandle, Props>(function BgmPlayer({ src, onPlayingChange }, ref) {
  const audioRef    = useRef<HTMLAudioElement>(null)
  const playingRef  = useRef(false)
  const interactedRef = useRef(false)
  const [, forceUpdate] = useState(0)

  function updatePlaying(next: boolean) {
    playingRef.current = next
    onPlayingChange?.(next)
    forceUpdate(n => n + 1)
  }

  async function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playingRef.current) {
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

  useImperativeHandle(ref, () => ({ toggle: togglePlay }))

  // iOS Safari: 最初のユーザー操作で自動再生
  useEffect(() => {
    function onFirstInteraction() {
      if (interactedRef.current) return
      interactedRef.current = true
      const audio = audioRef.current
      if (!audio) return
      audio.play().then(() => updatePlaying(true)).catch(() => {})
    }
    window.addEventListener('touchstart', onFirstInteraction, { once: true, passive: true })
    window.addEventListener('click',      onFirstInteraction, { once: true })
    return () => {
      window.removeEventListener('touchstart', onFirstInteraction)
      window.removeEventListener('click',      onFirstInteraction)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <audio ref={audioRef} src={src} loop preload="auto" />
})

export default BgmPlayer
