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

  const { data: usersData } = await admin.auth.admin.listUsers()
  const users = usersData?.users ?? []

  const { data: albums } = await admin
    .from('albums')
    .select('id, user_id, title')

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, display_name')

  const albumMap = new Map((albums ?? []).map((a) => [a.user_id, a]))
  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.display_name])
  )

  const senpaiUsers = users.filter((u) => u.email !== process.env.ADMIN_EMAIL)

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="px-1">
        <h1 className="text-2xl font-bold" style={{ color: '#000000' }}>先輩一覧</h1>
        <p className="mt-0.5 text-sm" style={{ color: '#8E8E93' }}>{senpaiUsers.length} 人</p>
      </div>

      {/* 新規追加 */}
      <CreateUserForm />

      {/* iOS グループリスト */}
      {senpaiUsers.length === 0 ? (
        <div
          className="rounded-2xl py-12 text-center text-sm"
          style={{ background: '#FFFFFF', color: '#8E8E93' }}
        >
          まだアカウントがありません
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF' }}>
          {senpaiUsers.map((user, index) => {
            const album = albumMap.get(user.id)
            const displayName = profileMap.get(user.id) ?? user.email
            const username = emailToUsername(user.email ?? '')
            const isLast = index === senpaiUsers.length - 1
            return (
              <Link
                key={user.id}
                href={`/admin/albums/${user.id}`}
                className="flex items-center justify-between px-4 transition-colors active:bg-[#F2F2F7]"
                style={{
                  minHeight: 64,
                  borderBottom: isLast ? 'none' : '1px solid #F2F2F7',
                }}
              >
                {/* 左: テキスト情報 */}
                <div className="flex-1 min-w-0 py-3">
                  <p className="font-semibold truncate" style={{ fontSize: 16, color: '#000000' }}>
                    {displayName}
                  </p>
                  <p className="mt-0.5 text-sm truncate" style={{ color: '#8E8E93' }}>
                    <EditUsernameButton userId={user.id} currentUsername={username} />
                  </p>
                  {album ? (
                    <p className="mt-0.5 text-xs truncate" style={{ color: '#6B5340' }}>
                      {album.title}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs" style={{ color: '#AEAEB2' }}>アルバム未作成</p>
                  )}
                </div>
                {/* 右: シェブロン */}
                <span className="ml-2 flex-shrink-0" style={{ color: '#C7C7CC', fontSize: 18 }}>›</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
