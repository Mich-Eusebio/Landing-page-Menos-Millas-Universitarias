import { generateSocialPost } from '@/lib/generate-asset'

export async function GET() {
  try {
    // Generate social vertical post with Day 15 and empty sponsor photo (uses placeholder)
    const buffer = await generateSocialPost({ day: '15', sponsorPhotoUrl: '' })

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store, must-revalidate',
      },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
