'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません')
      setLoading(false)
      return
    }

    router.push('/album')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* メールアドレス */}
      <div>
        <label className="block text-xs text-[#8b6340] mb-1.5 tracking-widest uppercase">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded bg-[#0f0a04] border border-[#8b6340]/40 px-4 py-3 text-[#f5e6d0] text-sm placeholder-[#8b6340]/50 focus:outline-none focus:border-[#d4843a] transition-colors"
          placeholder="your@email.com"
        />
      </div>

      {/* パスワード */}
      <div>
        <label className="block text-xs text-[#8b6340] mb-1.5 tracking-widest uppercase">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full rounded bg-[#0f0a04] border border-[#8b6340]/40 px-4 py-3 text-[#f5e6d0] text-sm placeholder-[#8b6340]/50 focus:outline-none focus:border-[#d4843a] transition-colors"
          placeholder="••••••••"
        />
      </div>

      {/* エラーメッセージ */}
      {error && (
        <p className="text-xs text-red-400/80 text-center">{error}</p>
      )}

      {/* ログインボタン */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-[#d4843a] px-4 py-3 text-sm font-semibold text-[#1a1208] tracking-wide hover:bg-[#e8a85a] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '読み込み中...' : 'アルバムを開く'}
      </button>
    </form>
  )
}
