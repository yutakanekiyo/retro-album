'use client'

export default function PreviewCloseButton() {
  return (
    <button
      onClick={() => window.close()}
      className="text-xs text-[#1a1208]/60 hover:text-[#1a1208] transition-colors"
    >
      閉じる ×
    </button>
  )
}
