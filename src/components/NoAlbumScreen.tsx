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
    <div className="flex h-dvh flex-col" style={{ background: '#FAF6F0' }}>
      {/* ヘッダー */}
      <div className="bg-white/60 backdrop-blur-md border-b border-[#D9CFC4]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex h-12 items-center justify-between px-3">
          <button
            onClick={handleLogout}
            className="font-ui text-xs px-3 py-1.5 rounded-full border border-[#D9CFC4] bg-white/70 text-[#6B5E54] hover:border-[#B85C3C] hover:text-[#B85C3C] transition-colors"
          >
            ログアウト
          </button>
          <span className="font-display" style={{ fontSize: 17, color: '#2C2420', fontWeight: 600 }}>
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
