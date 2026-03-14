'use client'

import Image from 'next/image'
import type { AlbumItem } from './AlbumViewer'

type Props = {
  items: AlbumItem[]
  currentIndex: number
  onSelect: (index: number) => void
}

export default function ThumbnailGrid({ items, currentIndex, onSelect }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="grid grid-cols-3 gap-1">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onSelect(index)}
            className={`relative aspect-square overflow-hidden rounded transition-opacity ${
              index === currentIndex
                ? 'ring-2 ring-[#d4843a]'
                : 'opacity-80 hover:opacity-100'
            }`}
          >
            <Image
              src={item.thumbnailUrl ?? item.signedUrl}
              alt={item.caption ?? `Photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 200px"
            />
            {/* 動画アイコン */}
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-2xl drop-shadow">▶</span>
              </div>
            )}
            {/* 現在表示中のマーク */}
            {index === currentIndex && (
              <div className="absolute inset-0 bg-[#d4843a]/10" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
