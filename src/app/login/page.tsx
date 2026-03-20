import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/LoginForm'
import PageTransition from '@/components/PageTransition'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/album')

  return (
    <PageTransition>
      <div
        className="flex min-h-dvh flex-col items-center justify-center px-6"
        style={{ background: '#FFFFFF' }}
      >
        {/* メインコンテンツ */}
        <div className="w-full max-w-sm">
          {/* アプリ名 */}
          <div className="mb-8 text-center">
            <h1
              className="font-display block"
              style={{
                fontSize: 34,
                color: '#000000',
                letterSpacing: '0.04em',
                fontWeight: 700,
              }}
            >
              Retro Album
            </h1>
            <p
              className="mt-1"
              style={{ fontSize: 14, color: '#8E8E93' }}
            >
              思い出のかけら
            </p>
          </div>

          {/* フォームカード */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
          >
            <LoginForm />
          </div>
        </div>

        {/* 管理者リンク */}
        <a
          href="/admin-auth"
          className="mt-10 block text-center text-xs"
          style={{ color: '#AEAEB2' }}
        >
          アルバムを作成する方はこちら
        </a>
      </div>
    </PageTransition>
  )
}
