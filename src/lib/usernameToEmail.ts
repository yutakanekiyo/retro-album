// ユーザー名 → Supabase Auth に渡す内部メールアドレスへの変換
// ユーザーには「ユーザー名」として見せ、内部では固定ドメインのメールとして扱う。
const EMAIL_DOMAIN = 'retro-album.local'

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`
}
