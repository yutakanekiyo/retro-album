'use client'

import Image from 'next/image'
import type { AlbumItem } from './AlbumViewer'

type Props = {
  items: AlbumItem[]
  onPhotoClick: (index: number) => void
}

export default function GalleryView({ items, onPhotoClick }: Props) {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="grid grid-cols-3 gap-0.5">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onPhotoClick(index)}
            className="relative aspect-square overflow-hidden bg-[#F2F2F7] focus:outline-none"
          >
            {item.type === 'video' && !item.thumbnailUrl ? (
              <video
                src={item.signedUrl}
                preload="metadata"
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
            ) : (
              <Image
                src={item.thumbnailUrl ?? item.signedUrl}
                alt={item.caption ?? `Photo ${index + 1}`}
                fill
                className="object-cover opacity-90 transition-opacity hover:opacity-100"
                sizes="33vw"
              />
            )}
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-white/80 text-xl drop-shadow">▶</span>
              </div>
            )}
            {item.dateLabel && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 pb-1.5 pt-4">
                <p className="font-ui text-[10px] text-white/90">{item.dateLabel}</p>
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="h-8" />
    </div>
  )
}
