import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
    // ローカル dev では sharp が HEIC 非対応のため最適化オフ
    // 本番 (Vercel) では sharp が HEIC 対応のため最適化オン → WebP 変換・リサイズで高速化
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

export default nextConfig
