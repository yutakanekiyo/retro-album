// ─── 共有型 ──────────────────────────────────────────────────────────────────
export type RecordInfo = {
  jacketUrl:  string | null
  songTitle:  string | null
  songArtist: string | null
}

// ─── 共有 PRNG ────────────────────────────────────────────────────────────────
export function makeRng(seed: number) {
  let s = (seed >>> 0) ^ 0xdeadbeef
  if (s === 0) s = 1
  return () => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

export function shuffleIndices(count: number, rng: () => number): number[] {
  const arr = Array.from({ length: count }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ─── 素材アセット ─────────────────────────────────────────────────────────────
export const STICKER_ASSETS      = Array.from({ length: 47 }, (_, i) => `/assets/stickers/s${i + 1}.png`)
export const TEXT_STICKER_ASSETS = Array.from({ length: 14 }, (_, i) => `/assets/text-stickers/t${i + 1}.png`)
export const TAPE_ASSETS         = Array.from({ length: 20 }, (_, i) => `/assets/tapes/m${i + 1}.png`)
export const TEXTURE_ASSETS      = [
  '/assets/textures/bg1.jpg',
  '/assets/textures/bg2.jpg',
  '/assets/textures/bg3.jpeg',
  '/assets/textures/bg4.jpeg',
  '/assets/textures/bg5.jpeg',
  '/assets/textures/bg6.jpeg',
  '/assets/textures/bg7.jpeg',
  '/assets/textures/bg8.jpeg',
  '/assets/textures/bg9.jpeg',
  '/assets/textures/bg10.jpeg',
  '/assets/textures/bg11.jpeg',
  '/assets/textures/bg12.jpeg',
  '/assets/textures/bg13.jpeg',
]

export const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`
