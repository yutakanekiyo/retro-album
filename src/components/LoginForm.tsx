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
    <form onSubmit={handleSubmit} className="space-y-3 p-4">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoComplete="username"
        placeholder="ユーザー名"
        className="w-full focus:outline-none"
        style={{
          background: '#F2F2F7',
          border: 'none',
          borderRadius: 10,
          padding: '14px 16px',
          fontSize: 15,
          color: '#000000',
        }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        placeholder="パスワード"
        className="w-full focus:outline-none"
        style={{
          background: '#F2F2F7',
          border: 'none',
          borderRadius: 10,
          padding: '14px 16px',
          fontSize: 15,
          color: '#000000',
        }}
      />

      {error && (
        <p className="text-xs text-center" style={{ color: '#FF3B30' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full active:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        style={{
          background: '#6B5340',
          color: '#FFFFFF',
          borderRadius: 10,
          padding: '14px 16px',
          fontWeight: 600,
          fontSize: 15,
          border: 'none',
        }}
      >
        {loading ? '読み込み中...' : 'アルバムを開く'}
      </button>
    </form>
  )
}
