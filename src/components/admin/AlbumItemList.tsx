'use client'

import { useState } from 'react'
import Image from 'next/image'
import { updateCaption, updateDateLabel, moveItem, deleteItem } from '@/app/admin/actions'

type Item = {
  id: string
  type: 'photo' | 'video'
  signedUrl: string
  file_url: string
  caption: string | null
  date_label: string | null
  sort_order: number
}

type Props = {
  items: Item[]
}

export default function AlbumItemList({ items }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')
  const [editDateLabel, setEditDateLabel] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function startEdit(item: Item) {
    setEditingId(item.id)
    setEditCaption(item.caption ?? '')
    setEditDateLabel(item.date_label ?? '')
  }

  async function saveItem(item: Item) {
    setLoadingId(item.id)
    await updateCaption(item.id, editCaption)
    await updateDateLabel(item.id, editDateLabel)
    setEditingId(null)
    setLoadingId(null)
  }

  async function handleMove(item: Item, direction: 'up' | 'down') {
    setLoadingId(item.id)
    await moveItem(item.id, direction)
    setLoadingId(null)
  }

  async function handleDelete(item: Item) {
    setLoadingId(item.id)
    setConfirmDeleteId(null)
    await deleteItem(item.id, item.file_url, item.type)
    setLoadingId(null)
  }

  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-[#8b6340]">
        写真・動画がまだありません。上のフォームからアップロードしてください。
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="overflow-hidden rounded-lg border border-[#8b6340]/20 bg-[#2d1a0a]"
        >
          {/* サムネイル */}
          <div className="relative aspect-square bg-black">
            {item.type === 'photo' ? (
              <Image
                src={item.signedUrl}
                alt={item.caption ?? ''}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">🎬</div>
            )}
            <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-[#f5e6d0]">
              {index + 1}
            </span>
          </div>

          {/* 編集エリア */}
          <div className="space-y-2 p-2">
            {editingId === item.id ? (
              <div className="space-y-1.5">
                <input
                  value={editDateLabel}
                  onChange={(e) => setEditDateLabel(e.target.value)}
                  placeholder="日付ラベル（例: 2024.8.15）"
                  className="admin-input w-full py-1 text-xs"
                />
                <input
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="キャプション"
                  className="admin-input w-full py-1 text-xs"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveItem(item)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => saveItem(item)}
                    disabled={loadingId === item.id}
                    className="flex-1 rounded bg-[#d4843a] py-1 text-[10px] font-semibold text-[#1a1208] hover:bg-[#e8a85a] disabled:opacity-50"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 rounded border border-[#8b6340]/40 py-1 text-[10px] text-[#8b6340] hover:text-[#f5e6d0]"
                  >
                    戻す
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => startEdit(item)}
                className="min-h-[2rem] w-full text-left text-[10px] text-[#8b6340] transition-colors hover:text-[#f5e6d0]"
              >
                {item.date_label && (
                  <span className="block text-[#d4843a]/70">{item.date_label}</span>
                )}
                {item.caption ?? '+ キャプション / 日付を追加'}
              </button>
            )}

            {/* 操作ボタン */}
            <div className="flex gap-1">
              <button
                onClick={() => handleMove(item, 'up')}
                disabled={index === 0 || loadingId === item.id}
                className="flex-1 rounded border border-[#8b6340]/30 py-1 text-xs text-[#8b6340] transition-colors hover:text-[#f5e6d0] disabled:opacity-30"
                title="前へ"
              >
                ↑
              </button>
              <button
                onClick={() => handleMove(item, 'down')}
                disabled={index === items.length - 1 || loadingId === item.id}
                className="flex-1 rounded border border-[#8b6340]/30 py-1 text-xs text-[#8b6340] transition-colors hover:text-[#f5e6d0] disabled:opacity-30"
                title="後へ"
              >
                ↓
              </button>
              {confirmDeleteId === item.id ? (
                <>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={loadingId === item.id}
                    className="flex-1 rounded bg-red-700/80 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    確認
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 rounded border border-[#8b6340]/30 py-1 text-xs text-[#8b6340] hover:text-[#f5e6d0]"
                  >
                    戻す
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(item.id)}
                  disabled={loadingId === item.id}
                  className="flex-1 rounded border border-red-900/40 py-1 text-xs text-red-900/70 transition-colors hover:text-red-400 disabled:opacity-30"
                  title="削除"
                >
                  削除
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
