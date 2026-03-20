import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/LoginForm'
import PageTransition from '@/components/PageTransition'

const STICKER_COUNT = 47

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/album')

  const stickerIndex = Math.floor(Math.random() * STICKER_COUNT) + 1
  const stickerSrc = `/assets/stickers/s${stickerIndex}.png`

  return (
    <PageTransition>
      <div
        className="flex min-h-dvh flex-col items-center justify-center px-6"
        style={{ background: '#F2F2F7' }}
      >
        {/* メインコンテンツ */}
        <div className="w-full max-w-sm">
          {/* アプリ名 */}
          <div className="mb-8 text-center">
            {/* ステッカー（タイトルに少し被る位置） */}
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stickerSrc}
                alt=""
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  width: 72,
                  top: -36,
                  left: '50%',
                  transform: 'translateX(-50%) rotate(12deg)',
                  zIndex: 10,
                }}
              />
              <h1
                className="font-display block relative"
                style={{
                  fontSize: 64,
                  color: '#000000',
                  letterSpacing: '0.02em',
                  fontWeight: 500,
                }}
              >
                Replay.
              </h1>
            </div>
            <p
              className="mt-1"
              style={{ fontSize: 14, color: '#3A3A3C', fontWeight: 500 }}
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
