'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminPreviewButton() {
  const pathname = usePathname()
  const match = pathname.match(/\/admin\/albums\/([^/]+)/)

  if (match) {
    // アルバム管理ページ: そのユーザーのスクラップブックをプレビュー
    const userId = match[1]
    return (
      <Link
        href={`/admin/preview/${userId}`}
        target="_blank"
        className="rounded border border-[#E5E5EA] px-3 py-1.5 text-xs text-[#007AFF] hover:border-[#007AFF] hover:bg-[#007AFF]/10 transition-colors"
      >
        プレビュー ↗
      </Link>
    )
  }

  return null
}
