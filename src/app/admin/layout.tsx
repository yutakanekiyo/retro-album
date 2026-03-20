import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminPreviewButton from '@/components/admin/AdminPreviewButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin-auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as { role: string } | null)?.role !== 'admin') redirect('/album')

  return (
    <div className="min-h-screen bg-[#0f0a04] text-[#f5e6d0]">
      {/* 管理者ヘッダー */}
      <header className="border-b border-[#8b6340]/30 bg-[#1a1208] px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">🎞️</span>
            <Link href="/admin" className="text-sm font-bold tracking-widest text-[#d4843a] uppercase">
              Admin Panel
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <AdminPreviewButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        {children}
      </main>
    </div>
  )
}
