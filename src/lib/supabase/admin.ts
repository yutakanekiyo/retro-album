import { createClient } from '@supabase/supabase-js'

// service_role キーを使う管理者クライアント（サーバーサイド専用・型引数なし）
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
