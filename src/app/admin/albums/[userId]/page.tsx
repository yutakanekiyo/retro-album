import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import CreateAlbumForm from '@/components/admin/CreateAlbumForm'
import PhotoUploader from '@/components/admin/PhotoUploader'
import AlbumItemList from '@/components/admin/AlbumItemList'
import AlbumEditForm from '@/components/admin/AlbumEditForm'

type RawItem = {
  id: string
  type: 'photo' | 'video'
  file_url: string
  thumbnail_url: string | null
  caption: string | null
  sort_order: number
}

type Props = {
  params: Promise<{ userId: string }>
}

export default async function AlbumManagePage({ params }: Props) {
  const { userId } = await params
  const admin = createAdminClient()

  // ユーザー情報取得
  const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId)
  if (userError || !userData.user) notFound()
  const user = userData.user

  // プロフィール取得
  const { data: profileData } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single()
  const profile = profileData as { display_name: string } | null
  const displayName = profile?.display_name ?? user.email ?? userId

  // アルバム取得
  const { data: albumData } = await admin
    .from('albums')
    .select('id, title, description, bgm_url')
    .eq('user_id', userId)
    .single()
  const album = albumData as {
    id: string
    title: string
    description: string | null
    bgm_url: string | null
  } | null

  // アルバムアイテム取得 + 署名付きURL
  let items: (RawItem & { signedUrl: string })[] = []
  if (album) {
    const { data: rawItems } = await admin
      .from('album_items')
      .select('id, type, file_url, thumbnail_url, caption, sort_order')
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
    <div className="space-y-8">
      {/* パンくず */}
      <div className="flex items-center gap-2 text-sm text-[#8b6340]">
        <Link href="/admin" className="hover:text-[#d4843a] transition-colors">
          先輩一覧
        </Link>
        <span>›</span>
        <span className="text-[#f5e6d0]">{displayName}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#f5e6d0]">{displayName}</h1>
        <p className="text-xs text-[#8b6340]">{user.email}</p>
      </div>

      {/* アルバム作成 or 編集 */}
      {!album ? (
        <section className="rounded-lg border border-[#8b6340]/20 bg-[#1a1208] p-6 space-y-3">
          <h2 className="text-sm font-semibold text-[#d4843a] tracking-wide">アルバムを作成</h2>
          <CreateAlbumForm userId={userId} />
        </section>
      ) : (
        <>
          {/* アルバム情報編集 */}
          <section className="rounded-lg border border-[#8b6340]/20 bg-[#1a1208] p-6 space-y-3">
            <h2 className="text-sm font-semibold text-[#d4843a] tracking-wide">アルバム情報</h2>
            <AlbumEditForm album={album} />
          </section>

          {/* 写真アップロード */}
          <section className="rounded-lg border border-[#8b6340]/20 bg-[#1a1208] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#d4843a] tracking-wide">
                写真・動画を追加
              </h2>
              <span className="text-xs text-[#8b6340]">{items.length} 件</span>
            </div>
            <PhotoUploader
              albumId={album.id}
              userId={userId}
              nextSortOrder={nextSortOrder}
              onUploaded={() => {}}
            />
          </section>

          {/* アルバムアイテム一覧 */}
          <section className="rounded-lg border border-[#8b6340]/20 bg-[#1a1208] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[#d4843a] tracking-wide">
              アルバム内容（↑↓で並び替え）
            </h2>
            <AlbumItemList items={items} />
          </section>
        </>
      )}
    </div>
  )
}
