import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/LoginForm'
import PageTransition from '@/components/PageTransition'

const STICKER_COUNT = 47

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/album')

  const stickers = Array.from({ length: 3 }, () =>
    `/assets/stickers/s${Math.floor(Math.random() * STICKER_COUNT) + 1}.png`
  )

  return (
    <PageTransition>
      <div
        className="flex min-h-dvh flex-col items-center justify-center px-6"
        style={{ background: '#F2F2F7' }}
      >
        {/* メインコンテンツ */}
        <div className="w-full max-w-sm">
          {/* アプリ名 */}
          <div className="relative mb-8 text-center">
            {/* ステッカー3枚・逆三角形配置（最背面） */}
            {/* 上左 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stickers[0]} alt="" aria-hidden className="pointer-events-none absolute"
              style={{ width: 96, top: -80, left: '15%', transform: 'translateX(-50%) rotate(-14deg)', zIndex: 0 }} />
            {/* 上右 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stickers[1]} alt="" aria-hidden className="pointer-events-none absolute"
              style={{ width: 96, top: -80, left: '85%', transform: 'translateX(-50%) rotate(16deg)', zIndex: 0 }} />
            {/* 下中央 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stickers[2]} alt="" aria-hidden className="pointer-events-none absolute"
              style={{ width: 90, top: -14, left: '50%', transform: 'translateX(-50%) rotate(-8deg)', zIndex: 0 }} />

            {/* テキスト（ステッカーより前面） */}
            <h1
              className="font-display block relative"
              style={{
                fontSize: 64,
                color: '#000000',
                letterSpacing: '0.02em',
                fontWeight: 500,
                zIndex: 1,
                WebkitTextStroke: '6px #F2F2F7',
                paintOrder: 'stroke fill',
              }}
            >
              Replay.
            </h1>
            <p
              className="relative mt-1"
              style={{ fontSize: 14, color: '#3A3A3C', fontWeight: 500, zIndex: 1, WebkitTextStroke: '3px #F2F2F7', paintOrder: 'stroke fill' }}
            >
              Anfield F.C. 22へ送る、あなただけのアルバム。
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
