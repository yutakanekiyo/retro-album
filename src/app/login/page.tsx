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
      <div className="scanlines relative flex min-h-dvh flex-col items-center justify-center bg-[#1a1208] px-6 overflow-hidden">
        {/* 背景グラデーション */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#2d1a0a_0%,_#1a1208_50%,_#0a0604_100%)]" />

        {/* フィルムストリップ左右 */}
        <FilmStrip side="left" />
        <FilmStrip side="right" />

        {/* メインカード */}
        <div className="relative z-10 w-full max-w-sm">

          {/* ロゴ */}
          <div className="mb-10 text-center">
            {/* フィルムアイコン */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#8b6340]/40 bg-[#2d1a0a]/60 text-3xl shadow-[0_0_30px_rgba(212,132,58,0.15)]">
              🎞️
            </div>

            <h1 className="font-elite text-4xl tracking-[0.25em] text-[#f5e6d0]">
              RETRO
            </h1>
            <h2 className="font-elite text-xl tracking-[0.5em] text-[#d4843a]">
              ALBUM
            </h2>

            <div className="mx-auto mt-4 flex items-center gap-3 px-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8b6340]/60 to-[#8b6340]/60" />
              <div className="h-1 w-1 rounded-full bg-[#d4843a] shadow-[0_0_6px_#d4843a]" />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8b6340]/60 to-[#8b6340]/60" />
            </div>

            <p className="mt-3 font-elite text-[11px] tracking-[0.35em] text-[#8b6340] uppercase">
              Your Memories, Forever
            </p>
          </div>

          {/* ログインカード */}
          <div className="relative rounded border border-[#8b6340]/25 bg-[#2d1a0a]/70 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-sm">
            {/* カードコーナー装飾 */}
            <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
            <LoginForm />
          </div>

          <p className="mt-5 text-center font-elite text-[10px] tracking-[0.3em] text-[#8b6340]/50 uppercase">
            For your eyes only
          </p>
        </div>
      </div>
    </PageTransition>
  )
}

// コーナー装飾
function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const cls = {
    tl: 'top-0 left-0 border-t border-l',
    tr: 'top-0 right-0 border-t border-r',
    bl: 'bottom-0 left-0 border-b border-l',
    br: 'bottom-0 right-0 border-b border-r',
  }[pos]
  return (
    <div className={`absolute ${cls} h-4 w-4 border-[#d4843a]/60`} />
  )
}

// フィルムストリップ
function FilmStrip({ side }: { side: 'left' | 'right' }) {
  const holes = Array.from({ length: 24 })
  const border = side === 'left' ? 'border-r' : 'border-l'
  return (
    <div
      className={`absolute top-0 bottom-0 ${side === 'left' ? 'left-0' : 'right-0'} w-7 flex flex-col items-center ${border} border-[#8b6340]/15 bg-[#0a0604] gap-3 py-3 overflow-hidden`}
    >
      {holes.map((_, i) => (
        <div
          key={i}
          className="h-[10px] w-[14px] shrink-0 rounded-sm bg-[#1a1208] border border-[#8b6340]/25"
        />
      ))}
    </div>
  )
}
