'use client'

import { useState } from 'react'
import { updateUsername } from '@/app/admin/actions'

interface Props {
  userId: string
  currentUsername: string
}

export default function EditUsernameButton({ userId, currentUsername }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentUsername)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (value.trim() === currentUsername) { setEditing(false); return }
    setLoading(true)
    setError(null)
    try {
      await updateUsername(userId, value.trim())
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-[#8b6340] hover:text-[#d4843a] transition-colors"
        title="ユーザー名を変更"
      >
        {currentUsername} ✎
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        autoFocus
        className="admin-input py-0.5 px-2 text-xs w-32"
      />
      <button
        type="submit"
        disabled={loading}
        className="text-xs text-[#d4843a] hover:text-[#e8a85a] disabled:opacity-50"
      >
        {loading ? '…' : '保存'}
      </button>
      <button
        type="button"
        onClick={() => { setEditing(false); setValue(currentUsername) }}
        className="text-xs text-[#8b6340] hover:text-[#f5e6d0]"
      >
        取消
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </form>
  )
}
