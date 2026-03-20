'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  displayName: string
  preloadUrls: string[]
  onOpen: () => void
}

const MIN_MS      = 2500  // 最低表示時間
const HARD_CAP_MS = 5000  // プリロード待ち上限

function preloadImages(urls: string[]): Promise<void> {
  return Promise.all(
    urls.map(
      url => new Promise<void>((resolve) => {
        const img = new Image()
        img.onload  = () => resolve()
        img.onerror = () => resolve()  // エラーでも止めない
        img.src = url
      })
    )
  ).then(() => {})
}

export default function WelcomeScreen({ displayName, preloadUrls, onOpen }: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const minTimer = new Promise<void>(r => setTimeout(r, MIN_MS))
    const preload  = preloadImages(preloadUrls)
    const hardCap  = new Promise<void>(r => setTimeout(r, HARD_CAP_MS))

    // 最低時間 + プリロード完了、または上限到達でボタンを表示
    Promise.race([
      Promise.all([minTimer, preload]),
      hardCap,
    ]).then(() => setReady(true))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: '#FFFFFF',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* ブランド名 */}
      <p
        className="font-display"
        style={{ fontSize: 18, color: '#C7C7CC', letterSpacing: '0.08em', marginBottom: 48 }}
      >
        Replay.
      </p>

      {/* 宛先 */}
      <div style={{ textAlign: 'center', padding: '0 40px' }}>
        <p className="font-ui" style={{ fontSize: 15, color: '#8E8E93', marginBottom: 14 }}>
          このアルバムは
        </p>
        <h1
          className="font-ui"
          style={{
            fontSize: 44, fontWeight: 700,
            color: '#000000', lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
        >
          {displayName}
        </h1>
        <p className="font-ui" style={{ fontSize: 15, color: '#8E8E93', marginTop: 14 }}>
          へ贈られました
        </p>
      </div>

      {/* Volume Up ヒント */}
      <motion.div
        style={{ marginTop: 64, textAlign: 'center' }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      >
        <SpeakerIcon />
        <p className="font-ui" style={{ fontSize: 13, color: '#AEAEB2', marginTop: 10, letterSpacing: '0.04em' }}>
          Volume Up &amp; Scroll
        </p>
      </motion.div>

      {/* 開くボタン */}
      <AnimatePresence>
        {ready && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={onOpen}
            className="font-ui"
            style={{
              position: 'fixed',
              bottom: 'calc(env(safe-area-inset-bottom) + 44px)',
              left: '50%', transform: 'translateX(-50%)',
              background: '#6B5340',
              color: '#FFFFFF',
              borderRadius: 100,
              padding: '16px 56px',
              fontSize: 17, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(107, 83, 64, 0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            アルバムを開く
          </motion.button>
        )}
      </AnimatePresence>

      {/* ローディングインジケーター（ボタン表示前） */}
      <AnimatePresence>
        {!ready && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: 'calc(env(safe-area-inset-bottom) + 52px)',
              display: 'flex', gap: 6,
            }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#C7C7CC' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: 'easeInOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SpeakerIcon() {
  return (
    <svg
      width="32" height="32" viewBox="0 0 24 24"
      fill="none" stroke="#AEAEB2" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ margin: '0 auto', display: 'block' }}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}
