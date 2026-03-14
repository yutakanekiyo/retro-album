import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/album')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#1a1208] px-6 overflow-hidden">
      {/* 背景の装飾：フィルムストリップ左右 */}
      <FilmStrip side="left" />
      <FilmStrip side="right" />

      {/* メインカード */}
      <div className="relative z-10 w-full max-w-sm">
        {/* ロゴ・タイトル */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🎞️</div>
          <h1 className="text-3xl font-bold tracking-widest text-[#f5e6d0]">
            RETRO ALBUM
          </h1>
          <p className="mt-2 text-xs tracking-[0.3em] text-[#8b6340] uppercase">
            Your Memories, Forever
          </p>
          {/* 装飾ライン */}
          <div className="mx-auto mt-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#8b6340]/60" />
            <div className="h-1 w-1 rounded-full bg-[#d4843a]" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#8b6340]/60" />
          </div>
        </div>

        {/* ログインカード */}
        <div className="rounded-lg border border-[#8b6340]/30 bg-[#2d1a0a]/80 p-8 shadow-2xl backdrop-blur-sm">
          <LoginForm />
        </div>

        {/* 下部テキスト */}
        <p className="mt-6 text-center text-[10px] tracking-widest text-[#8b6340]/60 uppercase">
          For your eyes only
        </p>
      </div>
    </div>
  )
}

function FilmStrip({ side }: { side: 'left' | 'right' }) {
  const holes = Array.from({ length: 20 })
  return (
    <div
      className={`absolute top-0 bottom-0 ${side === 'left' ? 'left-0' : 'right-0'} w-8 flex flex-col items-center bg-[#0f0a04] border-${side === 'left' ? 'r' : 'l'} border-[#8b6340]/20 gap-4 py-4`}
    >
      {holes.map((_, i) => (
        <div
          key={i}
          className="h-4 w-4 rounded-sm bg-[#1a1208] border border-[#8b6340]/30 flex-shrink-0"
        />
      ))}
    </div>
  )
}
