'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminPreviewButton() {
  const pathname = usePathname()
  const match = pathname.match(/\/admin\/albums\/([^/]+)/)

  if (match) {
    const userId = match[1]
    return (
      <Link
        href={`/admin/preview/${userId}`}
        target="_blank"
        className="transition-opacity active:opacity-60"
        style={{ color: '#6B5340', fontSize: 15 }}
      >
        プレビュー ↗
      </Link>
    )
  }

  return <div />
}
