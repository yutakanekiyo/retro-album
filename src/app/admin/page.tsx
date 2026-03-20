import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import CreateUserForm from '@/components/admin/CreateUserForm'
import EditUsernameButton from '@/components/admin/EditUsernameButton'

const EMAIL_DOMAIN = '@retro-album.local'
function emailToUsername(email: string): string {
  return email.endsWith(EMAIL_DOMAIN) ? email.slice(0, -EMAIL_DOMAIN.length) : email
}

export default async function AdminPage() {
  const admin = createAdminClient()

  // 全ユーザーを取得
  const { data: usersData } = await admin.auth.admin.listUsers()
  const users = usersData?.users ?? []

  // 全アルバムを取得
  const { data: albums } = await admin
    .from('albums')
    .select('id, user_id, title')

  // 全プロフィールを取得
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, display_name')

  const albumMap = new Map((albums ?? []).map((a) => [a.user_id, a]))
  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.display_name])
  )

  // 管理者自身を除外
  const senpaiUsers = users.filter((u) => u.email !== process.env.ADMIN_EMAIL)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#f5e6d0]">先輩一覧</h1>
        <p className="mt-1 text-sm text-[#8b6340]">
          {senpaiUsers.length} 人のアカウント
        </p>
      </div>

      {/* 新規追加フォーム */}
      <CreateUserForm />

      {/* ユーザーリスト */}
      <div className="divide-y divide-[#8b6340]/20 rounded-lg border border-[#8b6340]/20 bg-[#1a1208]">
        {senpaiUsers.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#8b6340]">
            まだアカウントがありません。上のボタンから追加してください。
          </div>
        ) : (
          senpaiUsers.map((user) => {
            const album = albumMap.get(user.id)
            const displayName = profileMap.get(user.id) ?? user.email
            const username = emailToUsername(user.email ?? '')
            return (
              <div key={user.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-semibold text-[#f5e6d0]">{displayName}</p>
                  <p className="mt-0.5 text-xs text-[#8b6340]">
                    ユーザー名:{' '}
                    <EditUsernameButton userId={user.id} currentUsername={username} />
                  </p>
                  {album ? (
                    <p className="mt-0.5 text-xs text-[#d4843a]">
                      📔 {album.title}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-[#8b6340]/60">アルバム未作成</p>
                  )}
                </div>
                <Link
                  href={`/admin/albums/${user.id}`}
                  className="rounded border border-[#8b6340]/40 px-3 py-1.5 text-xs text-[#8b6340] hover:border-[#d4843a] hover:text-[#d4843a] transition-colors"
                >
                  管理 →
                </Link>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
