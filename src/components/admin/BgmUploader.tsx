'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getBgmUploadUrl, updateAlbum } from '@/app/admin/actions'

type Props = {
  albumId: string
  currentBgmPath: string | null
}

export default function BgmUploader({ albumId, currentBgmPath }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('audio/')) {
      setError('音声ファイルを選択してください（MP3, AAC など）')
      return
    }
    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const { signedUrl, path } = await getBgmUploadUrl(file.name)

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)))
        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.open('PUT', signedUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      await updateAlbum(albumId, { bgm_url: path })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  async function handleRemove() {
    if (!confirm('BGMを削除しますか？')) return
    await updateAlbum(albumId, { bgm_url: '' })
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {/* 現在のBGM */}
      {currentBgmPath ? (
        <div className="flex items-center justify-between rounded border border-[#8b6340]/20 bg-[#0f0a04] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎵</span>
            <span className="text-xs text-[#f5e6d0]/70 truncate max-w-[200px]">
              {currentBgmPath.split('/').pop()}
            </span>
          </div>
          <button
            onClick={handleRemove}
            className="text-xs text-[#8b6340] hover:text-red-400 transition-colors"
          >
            削除
          </button>
        </div>
      ) : (
        <p className="text-xs text-[#8b6340]/60">BGMが設定されていません</p>
      )}

      {/* アップロードボタン */}
      <div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded border border-[#8b6340]/40 px-4 py-2 text-sm text-[#8b6340] hover:border-[#d4843a] hover:text-[#d4843a] disabled:opacity-50 transition-colors"
        >
          {uploading ? `アップロード中... ${progress}%` : currentBgmPath ? 'BGMを変更' : 'BGMを追加'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs text-[#8b6340]/50">MP3, AAC, M4A 対応 · アルバム閲覧中にループ再生されます</p>
    </div>
  )
}
