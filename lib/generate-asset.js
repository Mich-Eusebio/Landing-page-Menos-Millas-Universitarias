import sharp from 'sharp'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

let interFontData = null
async function getFonts() {
  if (!interFontData) {
    interFontData = await readFile(join(process.cwd(), 'public', 'fonts', 'Inter-Variable.ttf'))
  }
  return [
    { name: 'Inter', data: interFontData, weight: 400, style: 'normal' },
    { name: 'Inter', data: interFontData, weight: 700, style: 'normal' },
    { name: 'Inter', data: interFontData, weight: 900, style: 'normal' },
  ]
}

async function toDataUri(buf) {
  return `data:image/png;base64,${buf.toString('base64')}`
}

async function gradientSvg(w, h, stops) {
  const [x2, y2] = h > w ? [0, 1] : [1, 0]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}" stop-opacity="${s[2]}"/>`).join('')}</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`
}

async function fetchBuf(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function renderSvg(node, w, h) {
  return satori(node, { width: w, height: h, fonts: await getFonts() })
}

export async function generateSocialPost({ day, sponsorPhotoUrl, baseUrl }) {
  const W = 1080, H = 1920

  const michaelBuf = await readFile(join(process.cwd(), 'public', 'EXCELENTE FOTO MÍA.png'))
  const michaelUri = await toDataUri(michaelBuf)

  let sponsorUri = ''
  if (sponsorPhotoUrl && sponsorPhotoUrl !== '' && sponsorPhotoUrl !== 'null' && sponsorPhotoUrl !== 'undefined') {
    try {
      sponsorUri = await toDataUri(await fetchBuf(sponsorPhotoUrl))
    } catch {}
  }

  const svg = await renderSvg(
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 60px', textAlign: 'center' }}>
      <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 24 }}>
        ¿y tu,{'\n'}compraste un día?
      </div>
      <div style={{ fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, maxWidth: 800 }}>
        {`yo tengo el ${day}`}{'\n'}
        del camino del primer ciego,{'\n'}
        dominicano, programador,{'\n'}
        rumbo a estudiar en EU
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 48, marginTop: 64, marginBottom: 32 }}>
        {sponsorUri ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <img src={sponsorUri} width={180} height={180} style={{ borderRadius: 90, border: '4px solid rgba(255,255,255,0.6)' }} />
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>Y TU</div>
          </div>
        ) : null}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <img src={michaelUri} width={180} height={180} style={{ borderRadius: 90, border: '4px solid rgba(255,255,255,0.6)' }} />
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>MICHAEL</div>
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: 16 }}>
        ya yo soy parte de esto
      </div>
    </div>,
    W, H
  )

  const textLayer = new Resvg(svg).render().asPng()
  const canvas = await sharp(
    await sharp(join(process.cwd(), 'public', 'campus_background.png'))
      .resize(W, H, { fit: 'cover' })
      .toBuffer()
  )
    .composite([
      { input: Buffer.from(await gradientSvg(W, H, [['0%', '#000', 0.05], ['40%', '#000', 0.18], ['100%', '#000', 0.65]])), blend: 'over' },
      { input: Buffer.from(textLayer), blend: 'over' },
    ])
    .png()
    .toBuffer()

  return canvas
}

export async function generateOgImage({ day, sponsorPhotoUrl, baseUrl }) {
  const W = 1200, H = 630

  const michaelBuf = await readFile(join(process.cwd(), 'public', 'EXCELENTE FOTO MÍA.png'))
  const michaelUri = await toDataUri(michaelBuf)

  let sponsorUri = ''
  if (sponsorPhotoUrl && sponsorPhotoUrl !== '' && sponsorPhotoUrl !== 'null' && sponsorPhotoUrl !== 'undefined') {
    try {
      sponsorUri = await toDataUri(await fetchBuf(sponsorPhotoUrl))
    } catch {}
  }

  const svg = await renderSvg(
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '40px 50px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
          ¿y tu, compraste un día?
        </div>
        <div style={{ fontSize: 56, fontWeight: 900, color: '#fff' }}>
          {`yo tengo el ${day}`}
        </div>
        <div style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4, marginTop: 4 }}>
          del camino del primer ciego, dominicano,{'\n'}
          programador, rumbo a estudiar en EU
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
          ya yo soy parte de esto
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20, marginLeft: 40 }}>
        {sponsorUri ? (
          <img src={sponsorUri} width={90} height={90} style={{ borderRadius: 45, border: '3px solid rgba(255,255,255,0.6)' }} />
        ) : null}
        <img src={michaelUri} width={90} height={90} style={{ borderRadius: 45, border: '3px solid rgba(255,255,255,0.6)' }} />
      </div>
    </div>,
    W, H
  )

  const textLayer = new Resvg(svg).render().asPng()
  const canvas = await sharp(
    await sharp(join(process.cwd(), 'public', 'campus_background.png'))
      .resize(W, H, { fit: 'cover' })
      .toBuffer()
  )
    .composite([
      { input: Buffer.from(await gradientSvg(W, H, [['0%', '#000', 0.4], ['100%', '#000', 0.1]])), blend: 'over' },
      { input: Buffer.from(textLayer), blend: 'over' },
    ])
    .png()
    .toBuffer()

  return canvas
}
