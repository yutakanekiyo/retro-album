import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AlbumViewer, { type AlbumItem } from '@/components/AlbumViewer'
import LogoutButton from '@/components/LogoutButton'

type RawAlbumItem = {
  id: string
  type: 'photo' | 'video'
  file_url: string
  thumbnail_url: string | null
  caption: string | null
  sort_order: number
}

export default async function AlbumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // プロフィール取得
  const { data: profileData } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()
  const profile = profileData as { display_name: string; avatar_url: string | null } | null

  // アルバム取得
  const { data: albumData } = await supabase
    .from('albums')
    .select('id, title, description, bgm_url')
    .eq('user_id', user.id)
    .single()
  const album = albumData as {
    id: string
    title: string
    description: string | null
    bgm_url: string | null
  } | null

  const displayName = profile?.display_name ?? user.email ?? 'ゲスト'

  // アルバムアイテム取得 & 署名付きURL生成
  let items: AlbumItem[] = []
  if (album) {
    const { data: rawItems } = await supabase
      .from('album_items')
      .select('id, type, file_url, thumbnail_url, caption, sort_order')
      .eq('album_id', album.id)
      .order('sort_order', { ascending: true })

    if (rawItems && rawItems.length > 0) {
      items = await Promise.all(
        (rawItems as RawAlbumItem[]).map(async (item) => {
          const bucket = item.type === 'photo' ? 'album-photos' : 'album-videos'

          // 署名付きURL生成（1時間有効）
          const { data: urlData } = await supabase.storage
            .from(bucket)
            .createSignedUrl(item.file_url, 3600)

          let thumbnailUrl: string | null = null
          if (item.thumbnail_url) {
            const { data: thumbData } = await supabase.storage
              .from(bucket)
              .createSignedUrl(item.thumbnail_url, 3600)
            thumbnailUrl = thumbData?.signedUrl ?? null
          }

          return {
            id: item.id,
            type: item.type,
            signedUrl: urlData?.signedUrl ?? item.file_url,
            thumbnailUrl,
            caption: item.caption,
            sort_order: item.sort_order,
          }
        })
      )
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-[#1a1208]">
      {/* ヘッダー */}
      <header className="flex shrink-0 items-center justify-between border-b border-[#8b6340]/20 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎞️</span>
          <span className="text-sm font-semibold tracking-widest text-[#f5e6d0] uppercase">
            {album?.title ?? 'Retro Album'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-[#8b6340] sm:block">{displayName}</span>
          <LogoutButton />
        </div>
      </header>

      {/* アルバムビューア or 空状態 */}
      {album ? (
        <AlbumViewer items={items} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <p className="text-[#f5e6d0]">ようこそ、{displayName} さん</p>
          <p className="text-xs text-[#8b6340]">アルバムはまだ準備されていません</p>
        </div>
      )}
    </div>
  )
}
