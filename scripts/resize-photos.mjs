/**
 * 既存アルバム写真を一括リサイズするスクリプト
 *
 * 処理内容:
 *   1. album_items（type='photo'）を全件取得
 *   2. 各写真をダウンロード → Sharp でリサイズ → 再アップロード
 *      - thumbnail_url: 幅 800px、JPEG 品質 80%（スクラップブック/ギャラリー用）
 *      - file_url:      幅 1200px、JPEG 品質 85% で元ファイルを上書き（フルスクリーン用）
 *
 * 実行:
 *   node scripts/resize-photos.mjs
 */

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const SUPABASE_URL     = 'https://camdepgleoiqfdchzsoj.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhbWRlcGdsZW9pcWZkY2h6c29qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwMjQyMywiZXhwIjoyMDg5MDc4NDIzfQ.1LQffe3IyjZceu7371aYkEK53pHycGyVDXqQC9_BrfQ'

const BUCKET       = 'album-photos'
const THUMB_WIDTH  = 800   // スクラップブック/ギャラリー表示用
const FULL_WIDTH   = 1200  // フルスクリーン表示用
const THUMB_QUALITY = 80
const FULL_QUALITY  = 85

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// ─── ユーティリティ ──────────────────────────────────────────────────────────

function thumbPath(filePath) {
  const lastDot = filePath.lastIndexOf('.')
  const base = lastDot !== -1 ? filePath.slice(0, lastDot) : filePath
  return `${base}_thumb.jpg`
}

async function downloadToBuffer(path) {
  const { data, error } = await admin.storage.from(BUCKET).download(path)
  if (error) throw new Error(`Download failed [${path}]: ${error.message}`)
  const ab = await data.arrayBuffer()
  return Buffer.from(ab)
}

async function uploadBuffer(path, buffer) {
  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (error) throw new Error(`Upload failed [${path}]: ${error.message}`)
}

// ─── メイン ──────────────────────────────────────────────────────────────────

async function main() {
  // 全写真アイテム取得
  const { data: items, error } = await admin
    .from('album_items')
    .select('id, file_url, thumbnail_url')
    .eq('type', 'photo')
    .order('sort_order', { ascending: true })

  if (error) throw error
  if (!items || items.length === 0) {
    console.log('処理対象の写真がありません。')
    return
  }

  console.log(`処理対象: ${items.length} 件\n`)
  let success = 0
  let skipped = 0
  let failed  = 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const num  = `[${i + 1}/${items.length}]`

    // すでに thumbnail_url が設定済みならスキップ
    if (item.thumbnail_url) {
      console.log(`${num} スキップ（処理済み）: ${item.file_url}`)
      skipped++
      continue
    }

    console.log(`${num} 処理中: ${item.file_url}`)

    try {
      // 元ファイルをダウンロード
      const original = await downloadToBuffer(item.file_url)

      // メタ情報確認
      const meta = await sharp(original).metadata()
      const originalKB = Math.round(original.byteLength / 1024)
      console.log(`    元サイズ: ${meta.width}×${meta.height}px, ${originalKB}KB`)

      // ── サムネイル (800px, 80%) ───────────────────────────────────────────
      const thumbBuf = await sharp(original)
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
        .toBuffer()

      const tPath = thumbPath(item.file_url)
      await uploadBuffer(tPath, thumbBuf)
      console.log(`    サムネイル: ${Math.round(thumbBuf.byteLength / 1024)}KB → ${tPath}`)

      // ── フルスクリーン版 (1200px, 85%) 元ファイルを上書き ────────────────
      const fullBuf = await sharp(original)
        .resize({ width: FULL_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: FULL_QUALITY, mozjpeg: true })
        .toBuffer()

      await uploadBuffer(item.file_url, fullBuf)
      console.log(`    フルサイズ: ${Math.round(fullBuf.byteLength / 1024)}KB → ${item.file_url} (上書き)`)

      // DB 更新: thumbnail_url をセット
      const { error: updateError } = await admin
        .from('album_items')
        .update({ thumbnail_url: tPath })
        .eq('id', item.id)

      if (updateError) throw updateError

      console.log(`    ✓ 完了\n`)
      success++

    } catch (err) {
      console.error(`    ✗ エラー: ${err.message}\n`)
      failed++
    }
  }

  console.log('─────────────────────────────')
  console.log(`完了: ${success}件  スキップ: ${skipped}件  エラー: ${failed}件`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
