'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import ScrapbookView from './ScrapbookView'
import type { RecordInfo } from './ScrapbookView'
import GalleryView from './GalleryView'
import FullscreenViewer from './FullscreenViewer'
import BgmPlayer from './BgmPlayer'
import type { BgmPlayerHandle } from './BgmPlayer'
import type { AlbumItem } from './AlbumViewer'

type Props = {
  items: AlbumItem[]
  displayName: string
  bgmSignedUrl: string | null
  recordInfo: RecordInfo | null
}

type ViewMode = 'scrapbook' | 'gallery'

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

// ─── アイコン ─────────────────────────────────────────────────────────────────
function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#2C2420" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2"  y="2"  width="8" height="8" rx="1.5" />
      <rect x="12" y="2"  width="8" height="8" rx="1.5" />
      <rect x="2"  y="12" width="8" height="8" rx="1.5" />
      <rect x="12" y="12" width="8" height="8" rx="1.5" />
    </svg>
  )
}

function CollageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#2C2420" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1"  width="12" height="9"  rx="1.5" />
      <rect x="8" y="6"  width="13" height="15" rx="1.5" />
      <rect x="2" y="12" width="8"  height="9"  rx="1.5" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="#2C2420">
      <polygon points="6,3 19,11 6,19" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#2C2420" strokeWidth="2.2" strokeLinecap="round">
      <line x1="7"  y1="4" x2="7"  y2="18" />
      <line x1="15" y1="4" x2="15" y2="18" />
    </svg>
  )
}

const NAV_BTN: React.CSSProperties = {
  width: 56, height: 56, borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.45)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.18), 0 1px 4px rgba(0, 0, 0, 0.10)',
  cursor: 'pointer', flexShrink: 0,
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────
export default function AlbumPageClient({ items, displayName, bgmSignedUrl, recordInfo }: Props) {
  const router   = useRouter()
  const bgmRef   = useRef<BgmPlayerHandle>(null)
  const [viewMode,       setViewMode]       = useState<ViewMode>('scrapbook')
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null)
  const [bgmPlaying,     setBgmPlaying]     = useState(false)
  const [profileOpen,    setProfileOpen]    = useState(false)

  const initials  = getInitials(displayName)
  const showChrome = fullscreenIndex === null

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh', background: '#FFFFFF' }}
    >
      {/* BGM（ヘッドレス・audio のみ） */}
      {bgmSignedUrl && (
        <BgmPlayer ref={bgmRef} src={bgmSignedUrl} onPlayingChange={setBgmPlaying} />
      )}

      {/* ─── 名前ピル ────────────────────────────────────────────────────────── */}
      {showChrome && (
        <div
          className="font-ui"
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top) + 12px)',
            left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: 24,
            padding: '8px 20px',
            fontSize: 14, fontWeight: 500,
            color: '#2C2420',
            zIndex: 100,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.18), 0 1px 4px rgba(0, 0, 0, 0.10)',
          }}
        >
          {displayName}
        </div>
      )}

      {/* ─── コンテンツエリア（全画面） ─────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-ui text-sm" style={{ color: '#8E8E93' }}>
              — まだ写真がありません —
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'scrapbook' ? (
              <motion.div
                key="scrapbook"
                className="absolute inset-0 flex flex-col"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <ScrapbookView
                  items={items}
                  onPhotoClick={setFullscreenIndex}
                  recordInfo={recordInfo}
                  bgmPlaying={bgmPlaying}
                />
              </motion.div>
            ) : (
              <motion.div
                key="gallery"
                className="absolute inset-0 flex flex-col"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <GalleryView items={items} onPhotoClick={setFullscreenIndex} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ─── 下部フローティングナビ ──────────────────────────────────────────── */}
      {showChrome && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom) + 20px)',
            left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 16, alignItems: 'center',
            zIndex: 100,
          }}
        >
          {/* 左: 表示切替 */}
          <button
            onClick={() => setViewMode(v => v === 'scrapbook' ? 'gallery' : 'scrapbook')}
            aria-label={viewMode === 'scrapbook' ? 'ギャラリー表示' : 'スクラップブック表示'}
            style={NAV_BTN}
          >
            {viewMode === 'scrapbook' ? <GridIcon /> : <CollageIcon />}
          </button>

          {/* 中央: BGM（60px） */}
          <button
            onClick={() => bgmRef.current?.toggle()}
            aria-label={bgmPlaying ? '一時停止' : '再生'}
            style={{
              ...NAV_BTN,
              width: 60, height: 60,
              opacity: bgmSignedUrl ? 1 : 0.3,
              pointerEvents: bgmSignedUrl ? 'auto' : 'none',
            }}
          >
            {bgmPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          {/* 右: プロフィール（イニシャル） */}
          <button
            onClick={() => setProfileOpen(true)}
            aria-label="プロフィール"
            style={{ ...NAV_BTN, background: '#6B5340', border: 'none' }}
          >
            <span
              className="font-ui"
              style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.02em' }}
            >
              {initials}
            </span>
          </button>
        </div>
      )}

      {/* ─── プロフィールシート ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setProfileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }}
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                zIndex: 201,
                background: '#FFFFFF',
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                paddingTop: 20, paddingLeft: 24, paddingRight: 24,
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 32px)',
              }}
            >
              {/* ハンドルバー */}
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E5EA', margin: '0 auto 24px' }} />

              {/* アバター + 名前 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#6B5340',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span className="font-ui" style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
                    {initials}
                  </span>
                </div>
                <div>
                  <p className="font-ui" style={{ fontSize: 17, fontWeight: 600, color: '#000000' }}>
                    {displayName}
                  </p>
                  <p className="font-ui" style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>
                    Replay.
                  </p>
                </div>
              </div>

              {/* ログアウト */}
              <button
                onClick={handleLogout}
                className="w-full font-ui"
                style={{
                  background: '#F2F2F7',
                  borderRadius: 12,
                  padding: '14px 16px',
                  fontSize: 16, fontWeight: 500,
                  color: '#FF3B30',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'block',
                }}
              >
                ログアウト
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── フルスクリーンビューア ──────────────────────────────────────────── */}
      <AnimatePresence>
        {fullscreenIndex !== null && (
          <FullscreenViewer
            key={fullscreenIndex}
            items={items}
            initialIndex={fullscreenIndex}
            onClose={() => setFullscreenIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
