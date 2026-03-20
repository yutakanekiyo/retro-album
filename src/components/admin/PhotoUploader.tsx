'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSignedUploadUrl, saveAlbumItem } from '@/app/admin/actions'

type UploadFile = {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
  caption: string
  type: 'photo' | 'video'
}

// ─── ブラウザ側リサイズ（Canvas API）───────────────────────────────────────
async function resizeImage(file: File, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale  = img.width > maxWidth ? maxWidth / img.width : 1
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas context unavailable'))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('toBlob failed')),
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')) }
    img.src = url
  })
}

type Props = {
  albumId: string
  userId: string
  nextSortOrder: number
}

export default function PhotoUploader({ albumId, userId, nextSortOrder }: Props) {
  const router = useRouter()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return
    const items: UploadFile[] = Array.from(newFiles).map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: file.type.startsWith('video/') ? '' : URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
      caption: '',
      type: file.type.startsWith('video/') ? 'video' : 'photo',
    }))
    setFiles((prev) => [...prev, ...items])
  }, [])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  function updateCaption(id: string, caption: string) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, caption } : f)))
  }

  async function uploadAll() {
    const pending = files.filter((f) => f.status === 'pending')
    if (pending.length === 0) return
    setUploading(true)

    for (let i = 0; i < pending.length; i++) {
      const uploadFile = pending[i]
      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading' } : f))
      )

      try {
        const isPhoto = uploadFile.type === 'photo'

        // 写真はリサイズしてから送信（動画はそのまま）
        let fullBlob: Blob   = uploadFile.file
        let thumbBlob: Blob | null = null

        if (isPhoto) {
          // フルスクリーン用: 1200px JPEG 85%
          fullBlob  = await resizeImage(uploadFile.file, 1200, 0.85)
          // サムネイル用: 800px JPEG 80%
          thumbBlob = await resizeImage(uploadFile.file, 800, 0.80)
        }

        // フルサイズの署名付きURL取得
        const { signedUrl, path } = await getSignedUploadUrl(
          userId,
          uploadFile.file.name,
          uploadFile.type
        )

        // フルサイズをアップロード（XHR でプログレス対応）
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * (isPhoto ? 60 : 100))
              setFiles((prev) =>
                prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
              )
            }
          }
          xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)))
          xhr.onerror = () => reject(new Error('Upload failed'))
          xhr.open('PUT', signedUrl)
          xhr.setRequestHeader('Content-Type', 'image/jpeg')
          xhr.send(fullBlob)
        })

        // サムネイルをアップロード（写真のみ）
        let thumbPath: string | null = null
        if (isPhoto && thumbBlob) {
          const thumbName = uploadFile.file.name.replace(/\.[^.]+$/, '_thumb.jpg')
          const { signedUrl: thumbSignedUrl, path: tp } = await getSignedUploadUrl(
            userId,
            thumbName,
            'photo'
          )
          thumbPath = tp
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const progress = 60 + Math.round((e.loaded / e.total) * 35)
                setFiles((prev) =>
                  prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
                )
              }
            }
            xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)))
            xhr.onerror = () => reject(new Error('Thumbnail upload failed'))
            xhr.open('PUT', thumbSignedUrl)
            xhr.setRequestHeader('Content-Type', 'image/jpeg')
            xhr.send(thumbBlob!)
          })
        }

        // DBに保存
        await saveAlbumItem(
          albumId,
          path,
          uploadFile.type,
          uploadFile.caption,
          nextSortOrder + i,
          thumbPath,
        )

        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'done', progress: 100 } : f))
        )
      } catch {
        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'error' } : f))
        )
      }
    }

    setUploading(false)
    router.refresh()
    // 完了したファイルをクリア
    setTimeout(() => {
      setFiles((prev) => prev.filter((f) => f.status !== 'done'))
    }, 1500)
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length

  return (
    <div className="space-y-4">
      {/* ドロップゾーン */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? 'border-[#d4843a] bg-[#d4843a]/10'
            : 'border-[#8b6340]/40 hover:border-[#8b6340]'
        }`}
      >
        <p className="text-3xl mb-2">📷</p>
        <p className="text-sm text-[#f5e6d0]/70">
          クリックまたはドラッグ&ドロップで写真・動画を追加
        </p>
        <p className="text-xs text-[#8b6340] mt-1">JPG, PNG, WebP, MP4 対応・複数選択可</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* ファイルリスト */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded border border-[#8b6340]/20 bg-[#2d1a0a] p-3"
            >
              {/* サムネイル */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-[#1a1208]">
                {f.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">🎬</div>
                )}
              </div>

              {/* ファイル名 & キャプション */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate text-xs text-[#8b6340]">{f.file.name}</p>
                <input
                  type="text"
                  value={f.caption}
                  onChange={(e) => updateCaption(f.id, e.target.value)}
                  placeholder="キャプション（任意）"
                  disabled={f.status !== 'pending'}
                  className="admin-input py-1 text-xs"
                />
              </div>

              {/* ステータス */}
              <div className="shrink-0 text-right">
                {f.status === 'pending' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                    className="text-xs text-[#8b6340] hover:text-red-400 transition-colors"
                  >
                    削除
                  </button>
                )}
                {f.status === 'uploading' && (
                  <div className="text-xs text-[#d4843a]">{f.progress}%</div>
                )}
                {f.status === 'done' && <span className="text-xs text-green-400">✓</span>}
                {f.status === 'error' && <span className="text-xs text-red-400">✗</span>}
              </div>
            </div>
          ))}

          {/* アップロードボタン */}
          {pendingCount > 0 && (
            <button
              onClick={uploadAll}
              disabled={uploading}
              className="w-full rounded bg-[#d4843a] py-2.5 text-sm font-semibold text-[#1a1208] hover:bg-[#e8a85a] disabled:opacity-50 transition-colors"
            >
              {uploading ? 'アップロード中...' : `${pendingCount}件をアップロード`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
