import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

let fontBase64 = null
async function getFontBase64() {
  if (!fontBase64) {
    const buf = await readFile(join(process.cwd(), 'public', 'fonts', 'Inter-Variable.ttf'))
    fontBase64 = buf.toString('base64')
  }
  return fontBase64
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
    const cx = gw / 2
    const gap = 48, photoSize = 180
    const totalW = photoSize * 2 + gap
    const startX = (gw - totalW) / 2
    const bgUri = await toDataUri(await readFile(join(process.cwd(), 'public', 'campus_background.png')))

    body = `
    <image href="${bgUri}" width="${gw}" height="${gh}" preserveAspectRatio="xMidYMid slice"/>
    <rect width="${gw}" height="${gh}" fill="url(#gV)"/>

    <text class="t1" x="${cx}" y="660">¿y tu,</text>
    <text class="t1" x="${cx}" y="720">compraste un d\u00eda?</text>

    <text class="t2" x="${cx}" y="820">yo tengo el ${escapeXml(day)}</text>
    <text class="t2b" x="${cx}" y="858">del camino del primer ciego,</text>
    <text class="t2b" x="${cx}" y="896">dominicano, programador,</text>
    <text class="t2b" x="${cx}" y="934">rumbo a estudiar en EU</text>

    ${sponsorUri ? `
    <clipPath id="spC"><circle cx="${startX + photoSize/2}" cy="1140" r="${photoSize/2}"/></clipPath>
    <image href="${escapeXml(sponsorUri)}" x="${startX}" y="1050" width="${photoSize}" height="${photoSize}" clip-path="url(#spC)"/>
    <rect x="${startX}" y="1050" width="${photoSize}" height="${photoSize}" rx="${photoSize/2}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="4"/>
    <text class="t3" x="${startX + photoSize/2}" y="1270">Y TU</text>
    ` : ''}

    <clipPath id="mC"><circle cx="${startX + photoSize + gap/2 + photoSize/2}" cy="1140" r="${photoSize/2}"/></clipPath>
    <image href="${escapeXml(michaelUri)}" x="${startX + photoSize + gap}" y="1050" width="${photoSize}" height="${photoSize}" clip-path="url(#mC)"/>
    <rect x="${startX + photoSize + gap}" y="1050" width="${photoSize}" height="${photoSize}" rx="${photoSize/2}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="4"/>
    <text class="t3" x="${startX + photoSize + gap + photoSize/2}" y="1270">MICHAEL</text>

    <text class="t4" x="${cx}" y="1390">ya yo soy parte de esto</text>
    `
  } else {
    const bgUri = await toDataUri(await readFile(join(process.cwd(), 'public', 'campus_background.png')))

    body = `
    <image href="${bgUri}" width="${gw}" height="${gh}" preserveAspectRatio="xMidYMid slice"/>
    <rect width="${gw}" height="${gh}" fill="url(#gH)"/>

    <text class="o1" x="50" y="300">¿y tu, compraste un d\u00eda?</text>
    <text class="o2" x="50" y="380">yo tengo el ${escapeXml(day)}</text>
    <text class="o3" x="50" y="430">del camino del primer ciego, dominicano,</text>
    <text class="o3" x="50" y="456">programador, rumbo a estudiar en EU</text>
    <text class="o4" x="50" y="500">ya yo soy parte de esto</text>

    ${sponsorUri ? `
    <clipPath id="spC"><circle cx="${gw - 230}" cy="300" r="45"/></clipPath>
    <image href="${escapeXml(sponsorUri)}" x="${gw - 275}" y="255" width="90" height="90" clip-path="url(#spC)"/>
    <rect x="${gw - 275}" y="255" width="90" height="90" rx="45" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3"/>
    ` : ''}

    <clipPath id="mC"><circle cx="${gw - 120}" cy="300" r="45"/></clipPath>
    <image href="${escapeXml(michaelUri)}" x="${gw - 165}" y="255" width="90" height="90" clip-path="url(#mC)"/>
    <rect x="${gw - 165}" y="255" width="90" height="90" rx="45" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3"/>
    `
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${gw}" height="${gh}">
    <defs>
      <style>
        @font-face { font-family:'Inter'; src:url(data:font/ttf;base64,${fb}) format('truetype'); font-weight:400; }
        @font-face { font-family:'Inter'; src:url(data:font/ttf;base64,${fb}) format('truetype'); font-weight:700; }
        @font-face { font-family:'Inter'; src:url(data:font/ttf;base64,${fb}) format('truetype'); font-weight:900; }
        ${isSocial ? `
        .t1{font-family:'Inter',sans-serif;font-weight:900;font-size:52px;fill:#fff;text-anchor:middle;}
        .t2{font-family:'Inter',sans-serif;font-weight:900;font-size:52px;fill:#fff;text-anchor:middle;}
        .t2b{font-family:'Inter',sans-serif;font-weight:400;font-size:26px;fill:rgba(255,255,255,0.85);text-anchor:middle;}
        .t3{font-family:'Inter',sans-serif;font-weight:900;font-size:18px;fill:#fff;text-anchor:middle;}
        .t4{font-family:'Inter',sans-serif;font-weight:700;font-size:22px;fill:rgba(255,255,255,0.9);text-anchor:middle;}
        ` : `
        .o1{font-family:'Inter',sans-serif;font-weight:900;font-size:36px;fill:#fff;}
        .o2{font-family:'Inter',sans-serif;font-weight:900;font-size:56px;fill:#fff;}
        .o3{font-family:'Inter',sans-serif;font-weight:400;font-size:16px;fill:rgba(255,255,255,0.85);}
        .o4{font-family:'Inter',sans-serif;font-weight:700;font-size:14px;fill:rgba(255,255,255,0.9);}
        `}
      </style>
      <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0.05"/>
        <stop offset="40%" stop-color="#000" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.65"/>
      </linearGradient>
      <linearGradient id="gH" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#000" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.1"/>
      </linearGradient>
    </defs>
    ${body}
  </svg>`
}

export async function generateSocialPost({ day, sponsorPhotoUrl }) {
  const W = 1080, H = 1920
  const michaelBuf = await readFile(join(process.cwd(), 'public', 'EXCELENTE FOTO MÍA.png'))
  const michaelUri = await toDataUri(michaelBuf)
  let sponsorUri = ''
  if (sponsorPhotoUrl && sponsorPhotoUrl !== '' && sponsorPhotoUrl !== 'null' && sponsorPhotoUrl !== 'undefined') {
    try { sponsorUri = await toDataUri(await fetchBuf(sponsorPhotoUrl)) } catch {}
  }
  const svg = await buildSvg(W, H, day, sponsorUri, michaelUri, 'social')
  return sharp(Buffer.from(svg)).png().toBuffer()
}

export async function generateOgImage({ day, sponsorPhotoUrl }) {
  const W = 1200, H = 630
  const michaelBuf = await readFile(join(process.cwd(), 'public', 'EXCELENTE FOTO MÍA.png'))
  const michaelUri = await toDataUri(michaelBuf)
  let sponsorUri = ''
  if (sponsorPhotoUrl && sponsorPhotoUrl !== '' && sponsorPhotoUrl !== 'null' && sponsorPhotoUrl !== 'undefined') {
    try { sponsorUri = await toDataUri(await fetchBuf(sponsorPhotoUrl)) } catch {}
  }
  const svg = await buildSvg(W, H, day, sponsorUri, michaelUri, 'og')
  return sharp(Buffer.from(svg)).png().toBuffer()
}
