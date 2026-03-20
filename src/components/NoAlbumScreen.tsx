'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NoAlbumScreen({ displayName }: { displayName: string }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-dvh flex-col" style={{ background: '#FFFFFF' }}>
      {/* ヘッダー */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#E5E5EA]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex h-12 items-center justify-between px-3">
          <button
            onClick={handleLogout}
            className="font-ui text-xs px-3 py-1.5 rounded-full border border-[#E5E5EA] bg-white text-[#8E8E93] hover:border-[#007AFF] hover:text-[#007AFF] transition-colors"
          >
            ログアウト
          </button>
          <span className="font-display" style={{ fontSize: 17, color: '#000000', fontWeight: 600 }}>
            {displayName}
          </span>
          <div className="w-16" />
        </div>
      </div>

      {/* 本文 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="font-elite text-lg tracking-widest text-[#d4843a]">NO ALBUM</p>
        <p className="text-xs text-[#8b6340]">アルバムはまだ準備されていません</p>
      </div>
    </div>
  )
}
