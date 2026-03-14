'use client'

import { useState } from 'react'
import Image from 'next/image'
import { updateCaption, moveItem, deleteItem } from '@/app/admin/actions'

type Item = {
  id: string
  type: 'photo' | 'video'
  signedUrl: string
  file_url: string
  caption: string | null
  sort_order: number
}

type Props = {
  items: Item[]
}

export default function AlbumItemList({ items }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  function startEdit(item: Item) {
    setEditingId(item.id)
    setEditCaption(item.caption ?? '')
  }

  async function saveCaption(item: Item) {
    setLoadingId(item.id)
    await updateCaption(item.id, editCaption)
    setEditingId(null)
    setLoadingId(null)
  }

  async function handleMove(item: Item, direction: 'up' | 'down') {
    setLoadingId(item.id)
    await moveItem(item.id, direction)
    setLoadingId(null)
  }

  async function handleDelete(item: Item) {
    if (!confirm(`この${item.type === 'photo' ? '写真' : '動画'}を削除しますか？`)) return
    setLoadingId(item.id)
    await deleteItem(item.id, item.file_url, item.type)
    setLoadingId(null)
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[#8b6340] py-4 text-center">
        写真・動画がまだありません。上のフォームからアップロードしてください。
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="rounded-lg border border-[#8b6340]/20 bg-[#2d1a0a] overflow-hidden"
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
            <span className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-[#f5e6d0]">
              {index + 1}
            </span>
          </div>

          {/* キャプション */}
          <div className="p-2 space-y-2">
            {editingId === item.id ? (
              <div className="space-y-1.5">
                <input
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="キャプション"
                  className="admin-input py-1 text-xs w-full"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveCaption(item)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => saveCaption(item)}
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
                className="w-full text-left text-[10px] text-[#8b6340] hover:text-[#f5e6d0] transition-colors min-h-[1.5rem]"
              >
                {item.caption ?? '+ キャプション'}
              </button>
            )}

            {/* 操作ボタン */}
            <div className="flex gap-1">
              <button
                onClick={() => handleMove(item, 'up')}
                disabled={index === 0 || loadingId === item.id}
                className="flex-1 rounded border border-[#8b6340]/30 py-1 text-xs text-[#8b6340] hover:text-[#f5e6d0] disabled:opacity-30 transition-colors"
                title="前へ"
              >
                ↑
              </button>
              <button
                onClick={() => handleMove(item, 'down')}
                disabled={index === items.length - 1 || loadingId === item.id}
                className="flex-1 rounded border border-[#8b6340]/30 py-1 text-xs text-[#8b6340] hover:text-[#f5e6d0] disabled:opacity-30 transition-colors"
                title="後へ"
              >
                ↓
              </button>
              <button
                onClick={() => handleDelete(item)}
                disabled={loadingId === item.id}
                className="flex-1 rounded border border-red-900/40 py-1 text-xs text-red-900/70 hover:text-red-400 disabled:opacity-30 transition-colors"
                title="削除"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
