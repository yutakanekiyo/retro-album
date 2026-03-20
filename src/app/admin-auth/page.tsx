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
    redirect((profile as { role: string } | null)?.role === 'admin' ? '/admin' : '/album')
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center px-6"
      style={{ background: '#FFFFFF' }}
    >
      {/* タイトル */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold" style={{ color: '#000000' }}>
          管理者ポータル
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#8E8E93' }}>Retro Album</p>
      </div>

      <AdminAuthForm />

      <a
        href="/login"
        className="mt-8 text-xs transition-opacity active:opacity-60"
        style={{ color: '#AEAEB2' }}
      >
        先輩のアルバムを見る方はこちら
      </a>
    </div>
  )
}
