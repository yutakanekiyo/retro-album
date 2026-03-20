import type { Metadata, Viewport } from 'next'
import { Noto_Serif_JP, Special_Elite, Caveat, Playfair_Display } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
})

const specialElite = Special_Elite({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-special-elite',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-caveat',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
})


export const metadata: Metadata = {
  title: 'Replay.',
  description: 'あなただけの思い出アルバム',
  manifest: '/manifest.json',
  // iOS PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Replay.',
    startupImage: [
      // iPhone 14 Pro Max
      { url: '/apple-icon', media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 14 / 13 / 12
      { url: '/apple-icon', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)' },
    ],
  },
  // OGP
  openGraph: {
    title: 'Replay.',
    description: 'あなただけの思い出アルバム',
    type: 'website',
  },
  // フォーマット検出をオフ（iOSが電話番号などを誤検知しないように）
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFFFFF',
  viewportFit: 'cover', // iPhone のノッチ・ホームバー対応
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSerifJP.variable} ${specialElite.variable} ${caveat.variable} ${playfair.variable} film-grain`}>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}
