import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import AlbumPageClient from '@/components/AlbumPageClient'
import PreviewCloseButton from '@/components/admin/PreviewCloseButton'
import type { AlbumItem } from '@/components/AlbumViewer'

type RawAlbumItem = {
  id: string
  type: 'photo' | 'video'
  file_url: string
  thumbnail_url: string | null
  caption: string | null
  date_label: string | null
  sort_order: number
}

type Props = { params: Promise<{ userId: string }> }

export default async function PreviewPage({ params }: Props) {
  const { userId } = await params
  const admin = createAdminClient()

  const { data: profileData } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single()
  const displayName = (profileData as { display_name: string } | null)?.display_name ?? 'プレビュー'

  const { data: albumData } = await admin
    .from('albums')
    .select('id, title, description, bgm_url')
    .eq('user_id', userId)
    .single()
  if (!albumData) notFound()
  const album = albumData as { id: string; title: string; description: string | null; bgm_url: string | null }

  // BGM 署名付きURL
  let bgmSignedUrl: string | null = null
  if (album.bgm_url) {
    const { data: bgmData } = await admin.storage.from('bgm').createSignedUrl(album.bgm_url, 3600)
    bgmSignedUrl = bgmData?.signedUrl ?? null
  }

  // レコードセクション情報
  let recordInfo: { jacketUrl: string | null; songTitle: string | null; songArtist: string | null } | null = null
  const { data: recData } = await admin
    .from('albums')
    .select('jacket_url, song_title, song_artist')
    .eq('user_id', userId)
    .single()
  if (recData) {
    const rd = recData as { jacket_url: string | null; song_title: string | null; song_artist: string | null }
    recordInfo = { jacketUrl: rd.jacket_url, songTitle: rd.song_title, songArtist: rd.song_artist }
  }

  // アルバムアイテム
  const { data: rawItems } = await admin
    .from('album_items')
    .select('id, type, file_url, thumbnail_url, caption, date_label, sort_order')
    .eq('album_id', album.id)
    .order('sort_order', { ascending: true })

  let items: AlbumItem[] = []
  if (rawItems && rawItems.length > 0) {
    items = await Promise.all(
      (rawItems as RawAlbumItem[]).map(async (item) => {
        const bucket = item.type === 'photo' ? 'album-photos' : 'album-videos'
        const { data: urlData } = await admin.storage.from(bucket).createSignedUrl(item.file_url, 3600)
        let thumbnailUrl: string | null = null
        if (item.thumbnail_url) {
          const { data: thumbData } = await admin.storage.from(bucket).createSignedUrl(item.thumbnail_url, 3600)
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

  return (
    <div className="flex h-dvh flex-col">
      {/* プレビューバナー */}
      <div className="flex items-center justify-center gap-3 bg-[#d4843a] px-4 py-1.5">
        <span className="text-xs font-semibold text-[#1a1208]">📽 プレビューモード — {displayName}</span>
        <PreviewCloseButton />
      </div>
      <div className="flex-1 overflow-hidden">
        <AlbumPageClient
          items={items}
          displayName={displayName}
          bgmSignedUrl={bgmSignedUrl}
          recordInfo={recordInfo}
        />
      </div>
    </div>
  )
}
