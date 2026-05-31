import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const day = searchParams.get('day') || '?'

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0a1628 0%, #1a2a4a 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 32px', background: 'rgba(59,130,246,0.1)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
        <div style={{ width: 32, height: 32, background: '#3b82f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#fff' }}>MM</div>
        <span style={{ fontSize: 14, fontWeight: 900, color: '#93c5fd', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Menos Millas Universitarias</span>
      </div>
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
