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
        className="rounded border border-[#8b6340]/40 px-3 py-1.5 text-xs text-[#d4843a] hover:border-[#d4843a] hover:bg-[#d4843a]/10 transition-colors"
      >
        プレビュー ↗
      </Link>
    )
  }

  return null
}
