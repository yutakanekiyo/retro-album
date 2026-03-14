import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(145deg, #2d1a0a 0%, #1a1208 60%, #0a0604 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {/* フィルムパーフォレーション（上） */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {[0,1,2,3,4].map((i) => (
            <div key={i} style={{ width: 28, height: 20, borderRadius: 4, background: '#0a0604', border: '1px solid rgba(139,99,64,0.4)' }} />
          ))}
        </div>
        {/* フィルム絵文字 */}
        <div style={{ fontSize: 220, lineHeight: 1 }}>🎞️</div>
        {/* パーフォレーション（下） */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {[0,1,2,3,4].map((i) => (
            <div key={i} style={{ width: 28, height: 20, borderRadius: 4, background: '#0a0604', border: '1px solid rgba(139,99,64,0.4)' }} />
          ))}
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
