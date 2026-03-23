'use client'

import { useState } from 'react'
import { changeUserPassword } from '@/app/admin/actions'

export default function ChangePasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const password = fd.get('password') as string
    const confirm = fd.get('confirm') as string
    if (password !== confirm) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }
    try {
      await changeUserPassword(userId, password)
      setDone(true)
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setDone(false)
    setError(null)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm transition-opacity active:opacity-60"
        style={{ color: '#6B5340', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        パスワードを変更
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF' }}>
      <p className="px-4 pt-4 pb-2 text-xs uppercase tracking-wide" style={{ color: '#8E8E93' }}>
        パスワード変更
      </p>

      {done ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm font-semibold" style={{ color: '#34C759' }}>パスワードを変更しました</p>
          <button
            onClick={handleClose}
            className="mt-4 px-6 py-2 rounded-xl text-sm transition-opacity active:opacity-70"
            style={{ background: '#F2F2F7', color: '#000000' }}
          >
            閉じる
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex items-center px-4" style={{ minHeight: 48, borderBottom: '1px solid #F2F2F7' }}>
            <label className="text-sm w-28 flex-shrink-0" style={{ color: '#000000' }}>新しいパスワード</label>
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
          <div className="flex items-center px-4" style={{ minHeight: 48 }}>
            <label className="text-sm w-28 flex-shrink-0" style={{ color: '#000000' }}>確認</label>
            <input
              name="confirm"
              type="text"
              required
              placeholder="もう一度入力"
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
              {loading ? '変更中...' : '変更する'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl text-sm transition-opacity active:opacity-70"
              style={{ background: '#F2F2F7', color: '#000000' }}
            >
              キャンセル
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
