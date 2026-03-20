'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// 管理者チェック（profiles.role = 'admin' で判定）
async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as { role: string } | null)?.role !== 'admin') throw new Error('Unauthorized')
  return user
}

// ===== ユーザー管理 =====

export async function listUsers() {
  await assertAdmin()
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) throw error
  return data.users
}

export async function createUser(email: string, password: string, displayName: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  })
  if (error) throw error

  // profiles は trigger で自動作成されるが、display_name を確実に設定
  await admin.from('profiles').upsert({ id: data.user.id, display_name: displayName })

  revalidatePath('/admin')
  return data.user
}

export async function updateUsername(userId: string, newUsername: string) {
  await assertAdmin()
  const { usernameToEmail } = await import('@/lib/usernameToEmail')
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    email: usernameToEmail(newUsername),
  })
  if (error) throw error
  revalidatePath('/admin')
}

export async function deleteUser(userId: string) {
  await assertAdmin()
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw error
  revalidatePath('/admin')
}

// ===== アルバム管理 =====

export async function createAlbum(userId: string, title: string, description: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('albums')
    .insert({ user_id: userId, title, description: description || null })
    .select()
    .single()
  if (error) throw error

  revalidatePath('/admin')
  revalidatePath(`/admin/albums/${userId}`)
  return data
}

export async function updateAlbum(
  albumId: string,
  fields: { title?: string; description?: string; bgm_url?: string; jacket_url?: string; song_title?: string; song_artist?: string }
) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('albums')
    .update(fields)
    .eq('id', albumId)
  if (error) throw error

  revalidatePath('/admin')
}

// ===== アップロード用署名付きURL取得 =====

export async function getSignedUploadUrl(
  userId: string,
  filename: string,
  type: 'photo' | 'video'
) {
  await assertAdmin()
  const admin = createAdminClient()

  const bucket = type === 'photo' ? 'album-photos' : 'album-videos'
  const ext = filename.split('.').pop()
  const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUploadUrl(path)
  if (error) throw error

  return { signedUrl: data.signedUrl, path }
}

// ===== アルバムアイテム管理 =====

export async function saveAlbumItem(
  albumId: string,
  filePath: string,
  type: 'photo' | 'video',
  caption: string,
  sortOrder: number,
  thumbnailPath?: string | null,
) {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('album_items')
    .insert({
      album_id: albumId,
      type,
      file_url: filePath,
      thumbnail_url: thumbnailPath ?? null,
      caption: caption || null,
      sort_order: sortOrder,
    })
    .select()
    .single()
  if (error) throw error

  revalidatePath('/admin/albums/[userId]', 'page')
  return data
}

export async function updateCaption(itemId: string, caption: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('album_items')
    .update({ caption: caption || null })
    .eq('id', itemId)
  if (error) throw error

  revalidatePath('/admin/albums/[userId]', 'page')
}

export async function updateDateLabel(itemId: string, dateLabel: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('album_items')
    .update({ date_label: dateLabel || null })
    .eq('id', itemId)
  if (error) throw error

  revalidatePath('/admin/albums/[userId]', 'page')
}

export async function moveItem(itemId: string, direction: 'up' | 'down') {
  await assertAdmin()
  const admin = createAdminClient()

  // 現在のアイテムを取得
  const { data: item, error: fetchError } = await admin
    .from('album_items')
    .select('id, album_id, sort_order')
    .eq('id', itemId)
    .single()
  if (fetchError || !item) throw fetchError

  const currentOrder = (item as { id: string; album_id: string; sort_order: number }).sort_order
  const albumId = (item as { id: string; album_id: string; sort_order: number }).album_id

  // 隣のアイテムを取得
  const { data: neighbor } = await admin
    .from('album_items')
    .select('id, sort_order')
    .eq('album_id', albumId)
    .eq('sort_order', direction === 'up' ? currentOrder - 1 : currentOrder + 1)
    .single()

  if (!neighbor) return

  const neighborItem = neighbor as { id: string; sort_order: number }

  // 順番を交換
  await admin.from('album_items').update({ sort_order: neighborItem.sort_order }).eq('id', itemId)
  await admin.from('album_items').update({ sort_order: currentOrder }).eq('id', neighborItem.id)

  revalidatePath('/admin/albums/[userId]', 'page')
}

export async function deleteItem(itemId: string, filePath: string, type: 'photo' | 'video') {
  await assertAdmin()
  const admin = createAdminClient()

  const bucket = type === 'photo' ? 'album-photos' : 'album-videos'

  // Storage から削除
  await admin.storage.from(bucket).remove([filePath])

  // DB から削除
  const { error } = await admin.from('album_items').delete().eq('id', itemId)
  if (error) throw error

  revalidatePath('/admin/albums/[userId]', 'page')
}

// ===== BGMアップロード用署名付きURL =====

export async function getBgmUploadUrl(filename: string) {
  await assertAdmin()
  const admin = createAdminClient()

  const ext = filename.split('.').pop()
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await admin.storage
    .from('bgm')
    .createSignedUploadUrl(path)
  if (error) throw error

  return { signedUrl: data.signedUrl, path }
}
