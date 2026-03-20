'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import ScrapbookView from './ScrapbookView'
import type { RecordInfo } from './ScrapbookView'
import GalleryView from './GalleryView'
import FullscreenViewer from './FullscreenViewer'
import BgmPlayer from './BgmPlayer'
import type { AlbumItem } from './AlbumViewer'

type Props = {
  items: AlbumItem[]
  displayName: string
  bgmSignedUrl: string | null
  recordInfo: RecordInfo | null
}

type ViewMode = 'scrapbook' | 'gallery'

// ─── アイコン ─────────────────────────────────────────────────────────────────
function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="11" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  )
}

function CollageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="10" height="8" rx="1" />
      <rect x="7" y="5" width="10" height="12" rx="1" />
      <rect x="2" y="10" width="7" height="7" rx="1" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4L6 9l5 5" />
    </svg>
  )
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────
export default function AlbumPageClient({ items, displayName, bgmSignedUrl, recordInfo }: Props) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('scrapbook')
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null)
  const [bgmPlaying, setBgmPlaying] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isDark = viewMode === 'gallery'

  return (
    <div
      className="flex h-dvh flex-col transition-colors duration-300"
      style={{ background: '#FFFFFF' }}
    >
      {/* ヘッダー */}
      <div
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
        className="bg-white/80 backdrop-blur-md border-b border-[#E5E5EA]"
      >
        <div className="flex h-12 items-center justify-between px-3">
          {/* 左: ログアウト */}
          <button
            onClick={handleLogout}
            aria-label="ログアウト"
            className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm border transition-colors"
            style={{ background: 'rgba(255,255,255,0.7)', color: '#000000', borderColor: '#E5E5EA' }}
          >
            <BackIcon />
          </button>

          {/* 中央: アルバム名 */}
          <span
            className="font-display"
            style={{
              fontSize: 17,
              color: '#000000',
              fontWeight: 600,
            }}
          >
            {displayName}
          </span>

          {/* 右: BGM + view toggle */}
          <div className="flex items-center gap-2">
            {bgmSignedUrl && (
              <BgmPlayer src={bgmSignedUrl} isDark={isDark} onPlayingChange={setBgmPlaying} />
            )}
            <button
              onClick={() => setViewMode(v => v === 'scrapbook' ? 'gallery' : 'scrapbook')}
              aria-label={viewMode === 'scrapbook' ? 'ギャラリー表示' : 'スクラップブック表示'}
              className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm border transition-colors"
              style={{ background: 'rgba(255,255,255,0.7)', color: '#000000', borderColor: '#E5E5EA' }}
            >
              {viewMode === 'scrapbook' ? <GridIcon /> : <CollageIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="relative flex-1 overflow-hidden">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p
              className="font-ui text-sm"
              style={{ color: '#8E8E93' }}
            >
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
                <ScrapbookView items={items} onPhotoClick={setFullscreenIndex} recordInfo={recordInfo} bgmPlaying={bgmPlaying} />
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

      {/* Fullscreen viewer overlay */}
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
