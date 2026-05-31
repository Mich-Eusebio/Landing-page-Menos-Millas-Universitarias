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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px', textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#60a5fa', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8 }}>Patrociné el</div>
        <div style={{ fontSize: 80, fontWeight: 900, color: '#fff', fontStyle: 'italic', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 8 }}>
          DÍA <span style={{ color: '#60a5fa' }}>#{day}</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Del Camino de Michael</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 32px', background: 'rgba(59,130,246,0.05)', borderTop: '1px solid rgba(59,130,246,0.1)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(147,197,253,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>menosmillas.com</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=31536000' },
    }
  )
}
