'use client'

import { useState } from 'react'
import { createAlbum } from '@/app/admin/actions'

export default function CreateAlbumForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    try {
      await createAlbum(
        userId,
        fd.get('title') as string,
        fd.get('description') as string
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="title"
          required
          placeholder="アルバムタイトル（例: 田中先輩への贈り物）"
          className="admin-input"
        />
        <input
          name="description"
          placeholder="説明（任意）"
          className="admin-input"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-[#d4843a] px-4 py-2 text-sm font-semibold text-[#1a1208] hover:bg-[#e8a85a] disabled:opacity-50 transition-colors"
      >
        {loading ? '作成中...' : 'アルバムを作成'}
      </button>
    </form>
  )
}
