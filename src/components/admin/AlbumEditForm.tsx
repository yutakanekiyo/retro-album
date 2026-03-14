'use client'

import { useState } from 'react'
import { updateAlbum } from '@/app/admin/actions'

type Album = {
  id: string
  title: string
  description: string | null
  bgm_url: string | null
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
        title: fd.get('title') as string,
        description: (fd.get('description') as string) || undefined,
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
