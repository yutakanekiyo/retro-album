'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { usernameToEmail } from '@/lib/usernameToEmail'

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    // @ が含まれていればメールアドレスとして使い、なければ固定ドメインに変換
    const email = username.includes('@') ? username.trim() : usernameToEmail(username)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('ユーザー名またはパスワードが正しくありません')
      setLoading(false)
      return
    }

    // role に応じてリダイレクト
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      if ((profile as { role: string } | null)?.role === 'admin') {
        router.push('/admin')
        router.refresh()
        return
      }
    }

    router.push('/album')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ユーザー名 */}
      <div>
        <label
          className="font-ui block mb-1.5 uppercase tracking-wider"
          style={{ fontSize: 11, color: '#9C8E82' }}
        >
          ユーザー名 / メールアドレス
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          placeholder="username または email@example.com"
          className="w-full focus:outline-none transition-colors"
          style={{
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid #D9CFC4',
            borderRadius: 12,
            padding: '14px 16px',
            minHeight: 48,
            color: '#2C2420',
            fontSize: 14,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#B85C3C' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#D9CFC4' }}
        />
      </div>

      {/* パスワード */}
      <div>
        <label
          className="font-ui block mb-1.5 uppercase tracking-wider"
          style={{ fontSize: 11, color: '#9C8E82' }}
        >
          パスワード
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full focus:outline-none transition-colors"
          style={{
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid #D9CFC4',
            borderRadius: 12,
            padding: '14px 16px',
            minHeight: 48,
            color: '#2C2420',
            fontSize: 14,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#B85C3C' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#D9CFC4' }}
        />
      </div>

      {/* エラーメッセージ */}
      {error && (
        <p
          className="text-xs text-center"
          style={{ color: 'rgba(184,92,60,0.9)' }}
        >
          {error}
        </p>
      )}

      {/* ログインボタン */}
      <button
        type="submit"
        disabled={loading}
        className="w-full transition-colors active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: '#B85C3C',
          color: '#FAF6F0',
          borderRadius: 12,
          minHeight: 48,
          fontWeight: 500,
          fontSize: 14,
          border: 'none',
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#A04E30' }}
        onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#B85C3C' }}
      >
        {loading ? '読み込み中...' : 'アルバムを開く'}
      </button>
    </form>
  )
}
