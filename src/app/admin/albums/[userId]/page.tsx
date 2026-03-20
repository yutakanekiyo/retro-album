import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import CreateAlbumForm from '@/components/admin/CreateAlbumForm'
import PhotoUploader from '@/components/admin/PhotoUploader'
import AlbumItemList from '@/components/admin/AlbumItemList'
import AlbumEditForm from '@/components/admin/AlbumEditForm'
import BgmUploader from '@/components/admin/BgmUploader'

type RawItem = {
  id: string
  type: 'photo' | 'video'
  file_url: string
  thumbnail_url: string | null
  caption: string | null
  date_label: string | null
  sort_order: number
}

type Props = {
  params: Promise<{ userId: string }>
}

export default async function AlbumManagePage({ params }: Props) {
  const { userId } = await params
  const admin = createAdminClient()

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId)
  if (userError || !userData.user) notFound()
  const user = userData.user

  const { data: profileData } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single()
  const profile = profileData as { display_name: string } | null
  const displayName = profile?.display_name ?? user.email ?? userId

  const { data: albumData } = await admin
    .from('albums')
    .select('id, title, description, bgm_url, jacket_url, song_title, song_artist')
    .eq('user_id', userId)
    .single()
  const album = albumData as {
    id: string
    title: string
    description: string | null
    bgm_url: string | null
    jacket_url: string | null
    song_title: string | null
    song_artist: string | null
  } | null

  let items: (RawItem & { signedUrl: string })[] = []
  if (album) {
    const { data: rawItems } = await admin
      .from('album_items')
      .select('id, type, file_url, thumbnail_url, caption, date_label, sort_order')
      .eq('album_id', album.id)
      .order('sort_order', { ascending: true })

    if (rawItems && rawItems.length > 0) {
      items = await Promise.all(
        (rawItems as RawItem[]).map(async (item) => {
          const bucket = item.type === 'photo' ? 'album-photos' : 'album-videos'
          const { data: urlData } = await admin.storage
            .from(bucket)
            .createSignedUrl(item.file_url, 3600)
          return { ...item, signedUrl: urlData?.signedUrl ?? '' }
        })
      )
    }
  }

  const nextSortOrder = items.length > 0
    ? Math.max(...items.map((i) => i.sort_order)) + 1
    : 1

  return (
    <div className="space-y-6">
      {/* ページ見出し */}
      <div className="px-1">
        <h1 className="text-2xl font-bold" style={{ color: '#000000' }}>{displayName}</h1>
        <p className="mt-0.5 text-sm" style={{ color: '#8E8E93' }}>{user.email}</p>
      </div>

      {!album ? (
        /* ── アルバム未作成 ── */
        <section>
          <p className="px-1 mb-2 text-xs uppercase tracking-wide" style={{ color: '#8E8E93' }}>
            アルバム
          </p>
          <div className="rounded-2xl overflow-hidden p-4" style={{ background: '#FFFFFF' }}>
            <CreateAlbumForm userId={userId} />
          </div>
        </section>
      ) : (
        <>
          {/* ── アルバム情報 ── */}
          <section>
            <p className="px-1 mb-2 text-xs uppercase tracking-wide" style={{ color: '#8E8E93' }}>
              アルバム情報
            </p>
            <div className="rounded-2xl p-4 space-y-3" style={{ background: '#FFFFFF' }}>
              <AlbumEditForm album={album} />
            </div>
          </section>

          {/* ── BGM ── */}
          <section>
            <p className="px-1 mb-2 text-xs uppercase tracking-wide" style={{ color: '#8E8E93' }}>
              BGM
            </p>
            <div className="rounded-2xl p-4" style={{ background: '#FFFFFF' }}>
              <BgmUploader albumId={album.id} currentBgmPath={album.bgm_url} />
            </div>
          </section>

          {/* ── 写真・動画 ── */}
          <section>
            <div className="px-1 mb-2 flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-wide" style={{ color: '#8E8E93' }}>
                写真・動画
              </p>
              <span className="text-xs" style={{ color: '#AEAEB2' }}>{items.length} 件</span>
            </div>
            <div className="rounded-2xl p-4" style={{ background: '#FFFFFF' }}>
              <PhotoUploader
                albumId={album.id}
                userId={userId}
                nextSortOrder={nextSortOrder}
              />
            </div>
          </section>

          {/* ── アルバム内容 ── */}
          {items.length > 0 && (
            <section>
              <p className="px-1 mb-2 text-xs uppercase tracking-wide" style={{ color: '#8E8E93' }}>
                並び替え
              </p>
              <div className="rounded-2xl p-4" style={{ background: '#FFFFFF' }}>
                <AlbumItemList items={items} />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
