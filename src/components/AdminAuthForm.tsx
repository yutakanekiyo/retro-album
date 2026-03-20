'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { registerAdmin } from '@/app/admin-auth/actions'
import { usernameToEmail } from '@/lib/usernameToEmail'

type Tab = 'login' | 'register'

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(139,99,64,0.4)',
  borderRadius: 10,
  padding: '12px 14px',
  color: '#f5e6d0',
  fontSize: 14,
  width: '100%',
  outline: 'none',
}

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
      // 作成後に自動ログイン
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
    <div className="w-full max-w-sm">
      {/* タブ */}
      <div className="flex mb-6 rounded-lg overflow-hidden border border-[#8b6340]/30">
        {(['login', 'register'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null) }}
            className="flex-1 py-2 text-sm transition-colors"
            style={{
              background: tab === t ? '#d4843a' : 'transparent',
              color: tab === t ? '#1a1208' : '#8b6340',
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t === 'login' ? 'ログイン' : '新規登録'}
          </button>
        ))}
      </div>

      <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
        <div>
          <label className="block mb-1.5 text-xs tracking-wider uppercase" style={{ color: '#8b6340' }}>
            ユーザー名 / メールアドレス
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
            placeholder="username または email"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#d4843a' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,99,64,0.4)' }}
          />
        </div>
        <div>
          <label className="block mb-1.5 text-xs tracking-wider uppercase" style={{ color: '#8b6340' }}>
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            minLength={tab === 'register' ? 8 : undefined}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#d4843a' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(139,99,64,0.4)' }}
          />
        </div>

        {error && (
          <p className="text-xs text-center" style={{ color: '#e8835a' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ background: '#d4843a', color: '#1a1208' }}
        >
          {loading ? '処理中...' : tab === 'login' ? '管理画面へ' : 'アカウントを作成'}
        </button>
      </form>
    </div>
  )
}
