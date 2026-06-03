import { generateSocialPost, generateOgImage } from '@/lib/generate-asset'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const day = searchParams.get('day') || ''
    const name = searchParams.get('name') || ''
    const photo = searchParams.get('photo') || ''
    const layout = searchParams.get('layout') || 'og'

    let buffer
    if (layout === 'social') {
      buffer = await generateSocialPost({ day, sponsorPhotoUrl: photo })
    } else {
      buffer = await generateOgImage({ day, sponsorPhotoUrl: photo })
    }

    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
