'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin-auth')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="transition-opacity active:opacity-60"
      style={{ color: '#FF3B30', fontSize: 15, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      ログアウト
    </button>
  )
}
