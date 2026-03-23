import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminPreviewButton from '@/components/admin/AdminPreviewButton'
import AdminLogoutButton from '@/components/admin/AdminLogoutButton'

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
    <div className="min-h-screen" style={{ background: '#F2F2F7' }}>
      {/* iOS風ナビゲーションバー */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: '#E5E5EA',
        }}
      >
        <div className="mx-auto max-w-2xl px-4" style={{ height: 44 }}>
          <div className="flex h-full items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-1 transition-opacity active:opacity-60"
              style={{ color: '#6B5340', fontSize: 17 }}
            >
              <span style={{ fontSize: 20 }}>‹</span>
              <span style={{ fontSize: 15 }}>先輩一覧</span>
            </Link>
            <span
              className="absolute left-1/2 -translate-x-1/2 font-semibold"
              style={{ fontSize: 17, color: '#000000' }}
            >
              Admin
            </span>
            <div className="flex items-center gap-4">
              <AdminPreviewButton />
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
