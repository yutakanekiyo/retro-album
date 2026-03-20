'use client'

import { useState } from 'react'
import { createUser } from '@/app/admin/actions'
import { usernameToEmail } from '@/lib/usernameToEmail'

export default function CreateUserForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    try {
      await createUser(
        usernameToEmail(fd.get('username') as string),
        fd.get('password') as string,
        fd.get('displayName') as string
      )
      setOpen(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-[#007AFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0066DD] transition-colors"
      >
        + 先輩を追加
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[#E5E5EA] bg-white p-5 space-y-3"
    >
      <h3 className="text-sm font-semibold text-[#000000]">新しい先輩アカウントを作成</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          name="displayName"
          required
          placeholder="表示名（例: 田中先輩）"
          className="admin-input"
        />
        <input
          name="username"
          type="text"
          required
          placeholder="ユーザー名（例: tanaka）"
          className="admin-input"
        />
        <input
          name="password"
          type="text"
          required
          minLength={8}
          placeholder="パスワード（8文字以上）"
          className="admin-input"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[#007AFF] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#0066DD] disabled:opacity-50 transition-colors"
        >
          {loading ? '作成中...' : '作成'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded border border-[#E5E5EA] px-4 py-1.5 text-sm text-[#8E8E93] hover:text-[#000000] transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
