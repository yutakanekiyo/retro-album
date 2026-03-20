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
        className="relative flex min-h-dvh flex-col items-center justify-center px-6 overflow-hidden"
        style={{ background: '#FFFFFF' }}
      >
        {/* 背景テクスチャ */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/textures/bg2.jpg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.25 }}
        />

        {/* フィルムグレインオーバーレイ */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            opacity: 0.03,
          }}
        />

        {/* 右上ステッカー */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/stickers/s8.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-4 right-4"
          style={{ width: 56, opacity: 0.35, transform: 'rotate(12deg)' }}
        />

        {/* 左下ステッカー */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/stickers/s22.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-6 left-4"
          style={{ width: 48, opacity: 0.28, transform: 'rotate(-10deg)' }}
        />

        {/* メインコンテンツ */}
        <div className="relative z-10 w-full max-w-sm">
          {/* アプリ名 */}
          <div className="mb-8 text-center">
            <h1
              className="font-display inline-block"
              style={{
                fontSize: 32,
                color: '#000000',
                letterSpacing: '0.08em',
                fontWeight: 600,
              }}
            >
              Retro Album
            </h1>
            <span
              className="font-caveat inline-block"
              style={{
                fontSize: 16,
                color: '#8E8E93',
                transform: 'rotate(-2deg)',
                marginLeft: 8,
              }}
            >
              思い出のかけら
            </span>

            {/* 区切り線 */}
            <div
              className="mx-auto mt-4"
              style={{ height: 1, background: '#E5E5EA', maxWidth: 200 }}
            />
          </div>

          {/* フォームラッパー */}
          <div className="relative">
            {/* マスキングテープ */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/tapes/m5.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                width: 88,
                top: -16,
                left: '50%',
                transform: 'translateX(-50%) rotate(-2deg)',
                zIndex: 10,
              }}
            />

            <LoginForm />
          </div>
        </div>

        {/* 管理者リンク（控えめ） */}
        <a
          href="/admin-auth"
          className="mt-10 block text-center text-xs"
          style={{ color: 'rgba(107,94,84,0.45)' }}
        >
          アルバムを作成する方はこちら
        </a>
      </div>
    </PageTransition>
  )
}
