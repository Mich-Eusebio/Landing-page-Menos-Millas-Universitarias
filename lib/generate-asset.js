import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { uploadAndGetBgRemovedUrl } from '@/lib/apis/ImageProcessor'

let fontBase64 = null
async function getFontBase64() {
  if (!fontBase64) {
    const buf = await readFile(join(process.cwd(), 'public', 'fonts', 'Inter-Variable.ttf'))
    fontBase64 = buf.toString('base64')
  }
  return fontBase64
}

let placeholderUri = null
async function getPlaceholderUri() {
  if (!placeholderUri) {
    const buf = await readFile(join(process.cwd(), 'public', 'sponsor-placeholder.png'))
    placeholderUri = await toDataUri(buf)
  }
  return placeholderUri
}

async function resolveSponsorUri(sponsorPhotoUrl) {
  const placeholder = await getPlaceholderUri()
  if (!sponsorPhotoUrl || sponsorPhotoUrl === '' || sponsorPhotoUrl === 'null' || sponsorPhotoUrl === 'undefined') {
    return placeholder
  }
  try {
    let source = sponsorPhotoUrl
    if (!/^https?:\/\//i.test(source)) {
      const cleaned = source.replace(/^\/+/, '').replace(/^public\//, '')
      source = join(process.cwd(), 'public', cleaned)
    }
    const transformedUrl = await uploadAndGetBgRemovedUrl(source)
    const buf = await fetchBuf(transformedUrl)
    return await toDataUri(buf)
  } catch (e) {
    console.error('resolveSponsorUri error:', e.message)
    return placeholder
  }
}

async function toDataUri(buf) {
  return `data:image/png;base64,${buf.toString('base64')}`
}

async function fetchBuf(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function buildSvg(w, h, day, sponsorUri, michaelUri, layout) {
  const fb = await getFontBase64()
  const isSocial = layout === 'social'
  const gw = w, gh = h

  let body
  if (isSocial) {
    const lx = 50
    const bgUri = await toDataUri(await readFile(join(process.cwd(), 'public', 'campus_background.png')))

    const spD = 480
    const spX = gw - lx - spD
    const spY = 580
    const spCx = spX + spD / 2
    const spCy = spY + spD / 2

    const bw = 130, bH = 46
    const bx = spX - bw - 20
    const by = spCy - bH / 2

    const mD = 140
    const mX = 165, mY = 1100
    const mCx = mX + mD / 2, mCy = mY + mD / 2

    const sbW = 360, sbH = 70
    const sbX = spX - sbW - 24
    const sbY = spCy - sbH / 2

    const bullets = [
      'Ciego',
      'Dominicano',
      'Programador',
      'Va a estudiar en NY',
      'El Primero!',
    ]
    const bulletStartY = 525
    const bulletStep = 50
    const bulletTextX = 110
    const bulletCx = 78

    const bulletMarkup = bullets.map((label, i) => {
      const cy = bulletStartY + i * bulletStep
      return `<circle cx="${bulletCx}" cy="${cy - 12}" r="6" fill="#fff"/>
      <text class="st3" x="${bulletTextX}" y="${cy}" filter="url(#ts)">${escapeXml(label)}</text>`
    }).join('\n    ')

    body = `
    <image href="${bgUri}" width="${gw}" height="${gh}" preserveAspectRatio="xMidYMid slice"/>
    <rect width="${gw}" height="${gh}" fill="url(#gV)"/>

    <text class="st1" x="${lx}" y="200" filter="url(#ts)">\u00bfY T\u00da, COMPRASTE</text>
    <text class="st1" x="${lx}" y="300" filter="url(#ts)">UN D\u00cdA?</text>

    <text class="st2" x="${lx}" y="420" filter="url(#ts)">yo tengo el ${escapeXml(day)}</text>
    ${bulletMarkup}

    <clipPath id="spC"><circle cx="${spCx}" cy="${spCy}" r="${spD / 2}"/></clipPath>
    <image href="${escapeXml(sponsorUri)}" x="${spX}" y="${spY}" width="${spD}" height="${spD}" clip-path="url(#spC)"/>
    <circle cx="${spCx}" cy="${spCy}" r="${spD / 2 - 3}" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="4"/>

    <rect x="${bx}" y="${by}" width="${bw}" height="${bH}" rx="10" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
    <path d="M${bx + bw - 5},${by + 8} L${bx + bw + 14},${by + bH / 2} L${bx + bw - 5},${by + bH - 8} Z" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
    <text x="${bx + bw / 2}" y="${by + bH / 2 + 8}" text-anchor="middle" fill="#fff" font-family="'Inter',sans-serif" font-weight="800" font-size="20" filter="url(#ts)">\u00bfY T\u00da?</text>

    <g filter="url(#ts)">
      <rect x="${sbX}" y="${sbY}" width="${sbW}" height="${sbH}" rx="18" fill="rgba(0,0,0,0.62)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <path d="M${sbX + sbW - 8},${sbY + 14} L${sbX + sbW + 22},${spCy} L${sbX + sbW - 8},${sbY + sbH - 14} Z" fill="rgba(0,0,0,0.62)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </g>
    <text x="${sbX + sbW / 2}" y="${sbY + sbH / 2 + 10}" text-anchor="middle" fill="#fff" font-family="'Inter',sans-serif" font-weight="800" font-size="28" filter="url(#ts)">Ya soy parte de esto</text>

    <clipPath id="mC"><circle cx="${mCx}" cy="${mCy}" r="${mD / 2}"/></clipPath>
    <image href="${escapeXml(michaelUri)}" x="${mX}" y="${mY}" width="${mD}" height="${mD}" clip-path="url(#mC)"/>
    <circle cx="${mCx}" cy="${mCy}" r="${mD / 2 - 2}" fill="none" stroke="#D4AF37" stroke-width="3"/>
    <text class="st5" x="${mCx}" y="${mY + mD + 40}" text-anchor="middle" filter="url(#ts)">Michael Eusebio</text>
    `
  } else {
    const bgUri = await toDataUri(await readFile(join(process.cwd(), 'public', 'campus_background.png')))

    body = `
    <image href="${bgUri}" width="${gw}" height="${gh}" preserveAspectRatio="xMidYMid slice"/>
    <rect width="${gw}" height="${gh}" fill="url(#gH)"/>

    <text class="o1" x="50" y="300" filter="url(#ts)">\u00bfy tu, compraste un d\u00eda?</text>
    <text class="o2" x="50" y="380" filter="url(#ts)">yo tengo el ${escapeXml(day)}</text>
    <text class="o3" x="50" y="440" filter="url(#ts)">del camino del primer ciego, dominicano,</text>
    <text class="o3" x="50" y="470" filter="url(#ts)">programador, rumbo a estudiar en EU</text>
    <text class="o4" x="50" y="520" filter="url(#ts)">ya yo soy parte de esto</text>

    <clipPath id="spC"><circle cx="${gw - 230}" cy="300" r="45"/></clipPath>
    <image href="${escapeXml(sponsorUri)}" x="${gw - 275}" y="255" width="90" height="90" clip-path="url(#spC)"/>
    <rect x="${gw - 275}" y="255" width="90" height="90" rx="45" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3"/>

    <clipPath id="mC"><circle cx="${gw - 120}" cy="300" r="45"/></clipPath>
    <image href="${escapeXml(michaelUri)}" x="${gw - 165}" y="255" width="90" height="90" clip-path="url(#mC)"/>
    <rect x="${gw - 165}" y="255" width="90" height="90" rx="45" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3"/>
    `
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${gw}" height="${gh}">
    <defs>
      <filter id="ts" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.55"/>
      </filter>
      <style>
        @font-face { font-family:'Inter'; src:url(data:font/ttf;base64,${fb}) format('truetype'); font-weight:400; }
        @font-face { font-family:'Inter'; src:url(data:font/ttf;base64,${fb}) format('truetype'); font-weight:600; }
        @font-face { font-family:'Inter'; src:url(data:font/ttf;base64,${fb}) format('truetype'); font-weight:700; }
        @font-face { font-family:'Inter'; src:url(data:font/ttf;base64,${fb}) format('truetype'); font-weight:900; }
        ${isSocial ? `
        .st1{font-family:'Inter',sans-serif;font-weight:900;font-size:72px;fill:#fff;letter-spacing:-1.5px;}
        .st2{font-family:'Inter',sans-serif;font-weight:800;font-size:64px;fill:#fff;letter-spacing:-1px;}
        .st3{font-family:'Inter',sans-serif;font-weight:700;font-size:36px;fill:#fff;letter-spacing:-0.5px;}
        .st4{font-family:'Inter',sans-serif;font-weight:900;font-size:22px;fill:#fff;text-anchor:middle;}
        .st5{font-family:'Inter',sans-serif;font-weight:800;font-size:30px;fill:#fff;letter-spacing:-0.5px;}
        ` : `
        .o1{font-family:'Inter',sans-serif;font-weight:900;font-size:36px;fill:#fff;}
        .o2{font-family:'Inter',sans-serif;font-weight:700;font-size:48px;fill:#fff;}
        .o3{font-family:'Inter',sans-serif;font-weight:500;font-size:20px;fill:#fff;}
        .o4{font-family:'Inter',sans-serif;font-weight:700;font-size:18px;fill:#fff;}
        `}
      </style>
      <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0.0"/>
        <stop offset="35%" stop-color="#000" stop-opacity="0.05"/>
        <stop offset="65%" stop-color="#000" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
      </linearGradient>
      <linearGradient id="gH" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#000" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.15"/>
      </linearGradient>
    </defs>
    ${body}
  </svg>`
}

export async function generateSocialPost({ day, sponsorPhotoUrl }) {
  const W = 1080, H = 1920
  const michaelBuf = await readFile(join(process.cwd(), 'public', 'EXCELENTE FOTO MÍA.png'))
  const michaelUri = await toDataUri(michaelBuf)
  const sponsorUri = await resolveSponsorUri(sponsorPhotoUrl)
  const svg = await buildSvg(W, H, day, sponsorUri, michaelUri, 'social')
  return sharp(Buffer.from(svg)).png().toBuffer()
}

export async function generateOgImage({ day, sponsorPhotoUrl }) {
  const W = 1200, H = 630
  const michaelBuf = await readFile(join(process.cwd(), 'public', 'EXCELENTE FOTO MÍA.png'))
  const michaelUri = await toDataUri(michaelBuf)
  const sponsorUri = await resolveSponsorUri(sponsorPhotoUrl)
  const svg = await buildSvg(W, H, day, sponsorUri, michaelUri, 'og')
  return sharp(Buffer.from(svg)).png().toBuffer()
}
