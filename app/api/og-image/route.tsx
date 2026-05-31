import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const day = searchParams.get('day') || '?'

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0a1628 0%, #1a2a4a 100%)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: '#fff' }}>
        DÍA #{day}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=31536000' },
    }
  )
}
