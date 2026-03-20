import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminAuthForm from '@/components/AdminAuthForm'

export default async function AdminAuthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    // 既にログイン済みなら role に応じてリダイレクト
    redirect((profile as { role: string } | null)?.role === 'admin' ? '/admin' : '/album')
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center px-6"
      style={{ background: '#0f0a04' }}
    >
      {/* ロゴ */}
      <div className="mb-8 text-center">
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#8b6340' }}>
          Retro Album
        </p>
        <h1 className="text-xl font-bold tracking-wide" style={{ color: '#d4843a' }}>
          管理者ポータル
        </h1>
      </div>

      <AdminAuthForm />

      <p className="mt-8 text-xs" style={{ color: '#4a3520' }}>
        先輩のアルバムを見る方は
        <a href="/login" className="ml-1 underline hover:text-[#8b6340] transition-colors" style={{ color: '#6b4530' }}>
          こちら
        </a>
      </p>
    </div>
  )
}
