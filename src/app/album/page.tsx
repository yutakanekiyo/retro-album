import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

export default async function AlbumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // プロフィール情報を取得
  const { data: profileData } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()
  const profile = profileData as { display_name: string; avatar_url: string | null } | null

  // このユーザーのアルバムを取得
  const { data: albumData } = await supabase
    .from('albums')
    .select('id, title, description')
    .eq('user_id', user.id)
    .single()
  const album = albumData as { id: string; title: string; description: string | null } | null

  const displayName = profile?.display_name ?? user.email ?? 'ゲスト'

  return (
    <div className="flex min-h-screen flex-col bg-[#1a1208]">
      {/* ヘッダー */}
      <header className="flex items-center justify-between border-b border-[#8b6340]/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎞️</span>
          <span className="text-sm font-semibold tracking-widest text-[#f5e6d0] uppercase">
            Retro Album
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#8b6340]">{displayName}</span>
          <LogoutButton />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        {album ? (
          <div className="text-center">
            <p className="mb-2 text-xs tracking-[0.3em] text-[#8b6340] uppercase">
              Album for
            </p>
            <h1 className="mb-1 text-3xl font-bold text-[#f5e6d0]">
              {displayName}
            </h1>
            <p className="text-sm text-[#8b6340]">{album.title}</p>
            {album.description && (
              <p className="mt-3 text-xs text-[#8b6340]/70">{album.description}</p>
            )}
            <div className="mt-8 rounded-lg border border-[#8b6340]/30 bg-[#2d1a0a]/60 px-8 py-6 text-center text-[#f5e6d0]/50 text-sm">
              アルバムビューアは Day 3 で実装予定
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-[#f5e6d0]">ようこそ、{displayName} さん</p>
            <p className="text-xs text-[#8b6340]">
              アルバムはまだ準備されていません
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
