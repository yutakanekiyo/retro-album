'use client'

import { useState } from 'react'
import { createUser } from '@/app/admin/actions'

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
        fd.get('email') as string,
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
        className="rounded bg-[#d4843a] px-4 py-2 text-sm font-semibold text-[#1a1208] hover:bg-[#e8a85a] transition-colors"
      >
        + 先輩を追加
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[#8b6340]/30 bg-[#2d1a0a] p-5 space-y-3"
    >
      <h3 className="text-sm font-semibold text-[#d4843a]">新しい先輩アカウントを作成</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          name="displayName"
          required
          placeholder="表示名（例: 田中先輩）"
          className="admin-input"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="メールアドレス"
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
          className="rounded bg-[#d4843a] px-4 py-1.5 text-sm font-semibold text-[#1a1208] hover:bg-[#e8a85a] disabled:opacity-50 transition-colors"
        >
          {loading ? '作成中...' : '作成'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded border border-[#8b6340]/40 px-4 py-1.5 text-sm text-[#8b6340] hover:text-[#f5e6d0] transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
