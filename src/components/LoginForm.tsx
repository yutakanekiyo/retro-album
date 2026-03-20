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
    const email = username.includes('@') ? username.trim() : usernameToEmail(username)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('ユーザー名またはパスワードが正しくありません')
      setLoading(false)
      return
    }

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
    <form onSubmit={handleSubmit}>
      {/* ユーザー名 row */}
      <div className="flex items-center px-4" style={{ minHeight: 52, borderBottom: '1px solid #F2F2F7' }}>
        <label style={{ fontSize: 13, color: '#000000', width: 96, flexShrink: 0 }}>
          ユーザー名
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          placeholder="username"
          className="flex-1 focus:outline-none text-right"
          style={{ fontSize: 15, color: '#000000', background: 'transparent' }}
        />
      </div>

      {/* パスワード row */}
      <div className="flex items-center px-4" style={{ minHeight: 52 }}>
        <label style={{ fontSize: 13, color: '#000000', width: 96, flexShrink: 0 }}>
          パスワード
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="flex-1 focus:outline-none text-right"
          style={{ fontSize: 15, color: '#000000', background: 'transparent' }}
        />
      </div>

      {/* エラー */}
      {error && (
        <p className="px-4 pt-3 text-xs text-center" style={{ color: '#FF3B30' }}>
          {error}
        </p>
      )}

      {/* ログインボタン */}
      <div className="px-4 pt-4 pb-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full active:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{
            background: '#6B5340',
            color: '#FFFFFF',
            borderRadius: 12,
            minHeight: 50,
            fontWeight: 600,
            fontSize: 15,
            border: 'none',
          }}
        >
          {loading ? '読み込み中...' : 'アルバムを開く'}
        </button>
      </div>
    </form>
  )
}
