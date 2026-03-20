'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { usernameToEmail } from '@/lib/usernameToEmail'

export async function registerAdmin(usernameOrEmail: string, password: string) {
  const email = usernameOrEmail.includes('@') ? usernameOrEmail.trim() : usernameToEmail(usernameOrEmail)
  const admin = createAdminClient()

  // ユーザー作成（メール確認なし）
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw new Error(error.message)

  // profiles に role='admin' を設定
  await admin.from('profiles').upsert({
    id: data.user.id,
    role: 'admin',
    display_name: email.split('@')[0],
  })

  return { email }
}
