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
        className="w-full rounded-2xl py-3 text-sm font-semibold transition-opacity active:opacity-70"
        style={{ background: '#6B5340', color: '#FFFFFF' }}
      >
        + 先輩を追加
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF' }}>
      <p className="px-4 pt-4 pb-2 text-xs uppercase tracking-wide" style={{ color: '#8E8E93' }}>
        新しい先輩アカウント
      </p>
      <form onSubmit={handleSubmit}>
        {/* 表示名 */}
        <div className="flex items-center px-4" style={{ minHeight: 48, borderBottom: '1px solid #F2F2F7' }}>
          <label className="text-sm w-24 flex-shrink-0" style={{ color: '#000000' }}>表示名</label>
          <input
            name="displayName"
            required
            placeholder="例: 田中先輩"
            className="flex-1 focus:outline-none text-right text-sm"
            style={{ color: '#000000', background: 'transparent' }}
          />
        </div>
        {/* ユーザー名 */}
        <div className="flex items-center px-4" style={{ minHeight: 48, borderBottom: '1px solid #F2F2F7' }}>
          <label className="text-sm w-24 flex-shrink-0" style={{ color: '#000000' }}>ユーザー名</label>
          <input
            name="username"
            type="text"
            required
            placeholder="例: tanaka"
            className="flex-1 focus:outline-none text-right text-sm"
            style={{ color: '#000000', background: 'transparent' }}
          />
        </div>
        {/* パスワード */}
        <div className="flex items-center px-4" style={{ minHeight: 48 }}>
          <label className="text-sm w-24 flex-shrink-0" style={{ color: '#000000' }}>パスワード</label>
          <input
            name="password"
            type="text"
            required
            minLength={6}
            placeholder="6文字以上"
            className="flex-1 focus:outline-none text-right text-sm"
            style={{ color: '#000000', background: 'transparent' }}
          />
        </div>

        {error && (
          <p className="px-4 py-2 text-xs text-center" style={{ color: '#FF3B30' }}>{error}</p>
        )}

        <div className="flex gap-2 px-4 py-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
            style={{ background: '#6B5340', color: '#FFFFFF' }}
          >
            {loading ? '作成中...' : '作成'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 py-3 rounded-xl text-sm transition-opacity active:opacity-70"
            style={{ background: '#F2F2F7', color: '#000000' }}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
