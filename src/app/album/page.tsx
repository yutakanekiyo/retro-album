import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AlbumItem } from '@/components/AlbumViewer'
import AlbumPageClient from '@/components/AlbumPageClient'
import NoAlbumScreen from '@/components/NoAlbumScreen'
import PageTransition from '@/components/PageTransition'

type RawAlbumItem = {
  id: string
  type: 'photo' | 'video'
  file_url: string
  thumbnail_url: string | null
  caption: string | null
  date_label: string | null
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

  // アルバム取得（基本フィールド）
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

  // レコードセクション用フィールド（DBマイグレーション後に有効になる。未実行でも正常動作する）
  let recordInfo: { jacketUrl: string | null; songTitle: string | null; songArtist: string | null } | null = null
  if (album) {
    const { data: recData } = await supabase
      .from('albums')
      .select('jacket_url, song_title, song_artist')
      .eq('user_id', user.id)
      .single()
    if (recData) {
      const rd = recData as { jacket_url: string | null; song_title: string | null; song_artist: string | null }
      recordInfo = { jacketUrl: rd.jacket_url, songTitle: rd.song_title, songArtist: rd.song_artist }
    }
  }

  const displayName = profile?.display_name ?? user.email ?? 'ゲスト'

  // BGM 署名付きURL生成
  let bgmSignedUrl: string | null = null
  if (album?.bgm_url) {
    const { data: bgmData } = await supabase.storage
      .from('bgm')
      .createSignedUrl(album.bgm_url, 7200)
    bgmSignedUrl = bgmData?.signedUrl ?? null
  }

  // アルバムアイテム取得 & 署名付きURL生成
  let items: AlbumItem[] = []
  if (album) {
    const { data: rawItems } = await supabase
      .from('album_items')
      .select('id, type, file_url, thumbnail_url, caption, date_label, sort_order')
      .eq('album_id', album.id)
      .order('sort_order', { ascending: true })

    if (rawItems && rawItems.length > 0) {
      items = await Promise.all(
        (rawItems as RawAlbumItem[]).map(async (item) => {
          const bucket = item.type === 'photo' ? 'album-photos' : 'album-videos'

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
            dateLabel: item.date_label,
            sort_order: item.sort_order,
          }
        })
      )
    }
  }

  return (
    <PageTransition>
      <div className="flex h-dvh flex-col">
        {/* メインコンテンツ */}
        {album ? (
          <AlbumPageClient
            items={items}
            displayName={displayName}
            bgmSignedUrl={bgmSignedUrl ?? null}
            recordInfo={recordInfo}
          />
        ) : (
          <NoAlbumScreen displayName={displayName} />
        )}
      </div>
    </PageTransition>
  )
}
