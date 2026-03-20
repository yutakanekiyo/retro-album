'use client'

import { useState } from 'react'
import { updateAlbum } from '@/app/admin/actions'

type Album = {
  id: string
  title: string
  description: string | null
  bgm_url: string | null
  jacket_url: string | null
  song_title: string | null
  song_artist: string | null
}

export default function AlbumEditForm({ album }: { album: Album }) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)
    const fd = new FormData(e.currentTarget)
    try {
      await updateAlbum(album.id, {
        title:       fd.get('title') as string,
        description: (fd.get('description') as string) || undefined,
        jacket_url:  (fd.get('jacket_url') as string) || undefined,
        song_title:  (fd.get('song_title') as string) || undefined,
        song_artist: (fd.get('song_artist') as string) || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-[#8b6340]">タイトル</label>
          <input
            name="title"
            defaultValue={album.title}
            required
            className="admin-input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#8b6340]">説明（任意）</label>
          <input
            name="description"
            defaultValue={album.description ?? ''}
            className="admin-input w-full"
          />
        </div>
      </div>
      {/* レコードセクション情報 */}
      <div className="border-t border-[#8b6340]/20 pt-3 space-y-3">
        <p className="text-xs font-semibold text-[#d4843a]">レコードセクション</p>
        <div>
          <label className="mb-1 block text-xs text-[#8b6340]">曲名</label>
          <input name="song_title" defaultValue={album.song_title ?? ''} className="admin-input w-full" placeholder="例: ひとつだけ" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#8b6340]">アーティスト名</label>
          <input name="song_artist" defaultValue={album.song_artist ?? ''} className="admin-input w-full" placeholder="例: 矢野顕子" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#8b6340]">ジャケ写 URL</label>
          <input name="jacket_url" defaultValue={album.jacket_url ?? ''} className="admin-input w-full" placeholder="https://..." />
          {album.jacket_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={album.jacket_url} alt="" className="mt-2 h-16 w-16 rounded-full object-cover" />
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-[#d4843a] px-4 py-2 text-sm font-semibold text-[#1a1208] hover:bg-[#e8a85a] disabled:opacity-50 transition-colors"
      >
        {loading ? '保存中...' : saved ? '✓ 保存しました' : '保存'}
      </button>
    </form>
  )
}
