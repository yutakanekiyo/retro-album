const CACHE_NAME = 'retro-album-v1'
const APP_SHELL = ['/', '/login', '/album']

// インストール: アプリシェルをキャッシュ
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
})

// アクティベート: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Supabase API・Next.js内部・HMRはキャッシュしない
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/')
  ) {
    return
  }

  // 画像・音声・動画 → キャッシュファースト（一度見た写真はオフラインでも表示）
  if (
    event.request.destination === 'image' ||
    event.request.destination === 'audio' ||
    event.request.destination === 'video' ||
    url.pathname.includes('/storage/v1/object/')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached
        try {
          const response = await fetch(event.request)
          if (response.ok) cache.put(event.request, response.clone())
          return response
        } catch {
          return new Response('', { status: 503 })
        }
      })
    )
    return
  }

  // JS・CSS・フォント → キャッシュファースト
  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'font'
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached
        const response = await fetch(event.request)
        if (response.ok) cache.put(event.request, response.clone())
        return response
      })
    )
    return
  }

  // ナビゲーション → ネットワークファースト（失敗時はキャッシュ）
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match('/album')
        return cached ?? new Response('Offline', { status: 503 })
      })
    )
  }
})
