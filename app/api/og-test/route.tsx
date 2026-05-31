import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3b82f6', fontSize: 60, color: 'white' }}>
      HELLO
    </div>,
    { width: 1200, height: 630 }
  )
}
