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

function FormRow({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  last,
}: {
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
  last?: boolean
}) {
  return (
    <div
      className="flex items-center px-4"
      style={{ minHeight: 48, borderBottom: last ? 'none' : '1px solid #F2F2F7' }}
    >
      <label className="text-sm flex-shrink-0 w-28" style={{ color: '#000000' }}>{label}</label>
      <input
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        required={required}
        className="flex-1 focus:outline-none text-right text-sm"
        style={{ color: '#000000', background: 'transparent' }}
      />
    </div>
  )
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
    <form onSubmit={handleSubmit}>
      <FormRow label="タイトル" name="title" defaultValue={album.title} required />
      <FormRow label="説明" name="description" defaultValue={album.description ?? ''} placeholder="任意" />

      {/* セパレーターとレコードセクション */}
      <p className="px-4 pt-4 pb-2 text-xs uppercase tracking-wide" style={{ color: '#8E8E93', borderTop: '1px solid #F2F2F7' }}>
        レコードセクション
      </p>
      <FormRow label="曲名" name="song_title" defaultValue={album.song_title ?? ''} placeholder="例: ひとつだけ" />
      <FormRow label="アーティスト" name="song_artist" defaultValue={album.song_artist ?? ''} placeholder="例: 矢野顕子" />
      <FormRow label="ジャケ写 URL" name="jacket_url" defaultValue={album.jacket_url ?? ''} placeholder="https://..." last />

      {album.jacket_url && (
        <div className="px-4 pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={album.jacket_url} alt="" className="h-14 w-14 rounded-full object-cover" />
        </div>
      )}

      {error && (
        <p className="px-4 py-2 text-xs text-center" style={{ color: '#FF3B30' }}>{error}</p>
      )}

      <div className="px-4 py-4" style={{ borderTop: '1px solid #F2F2F7' }}>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
          style={{ background: saved ? '#34C759' : '#6B5340', color: '#FFFFFF' }}
        >
          {loading ? '保存中...' : saved ? '✓ 保存しました' : '保存'}
        </button>
      </div>
    </form>
  )
}
