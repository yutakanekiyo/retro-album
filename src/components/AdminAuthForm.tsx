'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { registerAdmin } from '@/app/admin-auth/actions'
import { usernameToEmail } from '@/lib/usernameToEmail'

type Tab = 'login' | 'register'

export default function AdminAuthForm() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const email = identifier.includes('@') ? identifier.trim() : usernameToEmail(identifier)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('ユーザー名またはパスワードが正しくありません')
      setLoading(false)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { email } = await registerAdmin(identifier, password)
      const supabase = createClient()
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
      if (loginErr) throw new Error('アカウントは作成できましたが、ログインに失敗しました')
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      {/* セグメントコントロール */}
      <div
        className="flex rounded-xl p-1"
        style={{ background: '#E5E5EA' }}
      >
        {(['login', 'register'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null) }}
            className="flex-1 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: tab === t ? '#FFFFFF' : 'transparent',
              color: '#000000',
              fontWeight: tab === t ? 600 : 400,
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            {t === 'login' ? 'ログイン' : '新規登録'}
          </button>
        ))}
      </div>

      {/* フォームカード */}
      <form
        onSubmit={tab === 'login' ? handleLogin : handleRegister}
        className="rounded-2xl overflow-hidden"
        style={{ background: '#FFFFFF' }}
      >
        {/* ユーザー名 */}
        <div className="flex items-center px-4" style={{ minHeight: 52, borderBottom: '1px solid #F2F2F7' }}>
          <label className="text-sm w-24 flex-shrink-0" style={{ color: '#000000' }}>ユーザー名</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
            placeholder="username または email"
            className="flex-1 focus:outline-none text-right text-sm"
            style={{ color: '#000000', background: 'transparent' }}
          />
        </div>
        {/* パスワード */}
        <div className="flex items-center px-4" style={{ minHeight: 52 }}>
          <label className="text-sm w-24 flex-shrink-0" style={{ color: '#000000' }}>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            minLength={tab === 'register' ? 8 : undefined}
            className="flex-1 focus:outline-none text-right text-sm"
            style={{ color: '#000000', background: 'transparent' }}
          />
        </div>

        {error && (
          <p className="px-4 py-2 text-xs text-center" style={{ color: '#FF3B30', borderTop: '1px solid #F2F2F7' }}>
            {error}
          </p>
        )}

        <div className="px-4 py-4" style={{ borderTop: '1px solid #F2F2F7' }}>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
            style={{ background: '#6B5340', color: '#FFFFFF' }}
          >
            {loading ? '処理中...' : tab === 'login' ? '管理画面へ' : 'アカウントを作成'}
          </button>
        </div>
      </form>
    </div>
  )
}
