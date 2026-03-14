import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AlbumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1208]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#f5e6d0] mb-4">
          🎞️ アルバム
        </h1>
        <p className="text-[#8b6340]">
          アルバムビューアは Day 3 で実装予定
        </p>
      </div>
    </div>
  )
}
