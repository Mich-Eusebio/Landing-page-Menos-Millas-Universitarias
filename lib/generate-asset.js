import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { uploadAndGetBgRemovedUrl } from './apis/ImageProcessor.js'

let fontBase64 = null
let montserratBase64 = null

async function getFontBase64() {
  if (!fontBase64) {
    const buf = await readFile(join(process.cwd(), 'public', 'fonts', 'Inter-Variable.ttf'))
    fontBase64 = buf.toString('base64')
  }
  return fontBase64
}

async function getMontserratBase64() {
  if (!montserratBase64) {
    const buf = await readFile(join(process.cwd(), 'public', 'fonts', 'Montserrat-Variable.ttf'))
    montserratBase64 = buf.toString('base64')
  }
  return montserratBase64
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
  const mb = await getMontserratBase64()
  const isSocial = layout === 'social'
  const gw = w, gh = h

  console.log('[AssetGen] Starting buildSvg. Layout:', layout, 'Dimensions:', w, 'x', h)
  console.log('[AssetGen] FONTCONFIG_PATH is:', process.env.FONTCONFIG_PATH)
  console.log('[AssetGen] Current Working Directory is:', process.cwd())
  
  try {
    const interPath = join(process.cwd(), 'public', 'fonts', 'Inter-Variable.ttf')
    const montserratPath = join(process.cwd(), 'public', 'fonts', 'Montserrat-Variable.ttf')
    const fontsConfPath = join(process.cwd(), 'fonts.conf')
    
    console.log('[AssetGen] File existence check:')
    console.log(`  - Inter TTF: ${existsSync(interPath)} (Path: ${interPath})`)
    console.log(`  - Montserrat TTF: ${existsSync(montserratPath)} (Path: ${montserratPath})`)
    console.log(`  - fonts.conf: ${existsSync(fontsConfPath)} (Path: ${fontsConfPath})`)
    
    if (existsSync(fontsConfPath)) {
      console.log('[AssetGen] fonts.conf content:');
      console.log(readFileSync(fontsConfPath, 'utf8'));
    }
  } catch (err) {
    console.log('[AssetGen] Error verifying files:', err.message)
  }

  let body
  if (isSocial) {
    const bgUri = await toDataUri(await readFile(join(process.cwd(), 'public', 'campus_background.png')))

    const spD = 520
    const spX = 645, spY = 665
    const spCx = spX + spD / 2
    const spCy = spY + spD / 2

    const sbW = 340, sbH = 95
    const sbX = 440
    const sbY = 850

    const mD = 140
    const mX = 145, mY = 1000
    const mCx = mX + mD / 2, mCy = mY + mD / 2

    const bullets = [
      'Ciego',
      'Dominicano',
      'Programador',
      'Va a estudiar en NY',
      'El primero!',
    ]
    const bulletStartY = 560
    const bulletStep = 62
    const bulletTextX = 105
    const bulletCx = 78

    const bulletMarkup = bullets.map((label, i) => {
      const cy = bulletStartY + i * bulletStep
      return `<circle cx="${bulletCx}" cy="${cy - 14}" r="7" fill="#fff"/>
      <text class="st3" x="${bulletTextX}" y="${cy}" filter="url(#ts)">${escapeXml(label)}</text>`
    }).join('\n    ')

    body = `
    <image href="${bgUri}" width="${gw}" height="${gh}" preserveAspectRatio="xMidYMid slice"/>
    <rect width="${gw}" height="${gh}" fill="url(#gV)"/>

    <text class="st1" x="50" y="175" filter="url(#ts)">\u00bfY T\u00da, COMPRASTE</text>
    <text class="st1" x="50" y="275" filter="url(#ts)">UN D\u00cdA?</text>

    <text class="sh" x="95" y="460" filter="url(#tsh)">Tengo el ${escapeXml(day)}</text>
    ${bulletMarkup}

    <clipPath id="spC"><circle cx="${spCx}" cy="${spCy}" r="${spD / 2}"/></clipPath>
    <image href="${escapeXml(sponsorUri)}" x="${spX}" y="${spY}" width="${spD}" height="${spD}" clip-path="url(#spC)"/>
    <circle cx="${spCx}" cy="${spCy}" r="${spD / 2 - 3}" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="4"/>

    <g filter="url(#ts)">
      <rect x="${sbX}" y="${sbY}" width="${sbW}" height="${sbH}" rx="22" fill="#FF6B35" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>
      <path d="M${sbX + sbW - 8},${sbY + sbH/2 - 5} L${sbX + sbW + 130},${sbY + sbH/2 + 28} L${sbX + sbW - 8},${sbY + sbH/2 + 5} Z" fill="#FF6B35" stroke="rgba(255,255,255,0.4)" stroke-width="2.5"/>
    </g>
    <text x="${sbX + sbW / 2}" y="${sbY + sbH / 2 + 11}" text-anchor="middle" fill="#fff" font-family="'Montserrat','Inter',sans-serif" font-weight="800" font-size="32">Ya soy parte de esto</text>

    <clipPath id="mC"><circle cx="${mCx}" cy="${mCy}" r="${mD / 2}"/></clipPath>
    <image href="${escapeXml(michaelUri)}" x="${mX}" y="${mY}" width="${mD}" height="${mD}" clip-path="url(#mC)"/>
    <circle cx="${mCx}" cy="${mCy}" r="${mD / 2 - 2}" fill="none" stroke="#D4AF37" stroke-width="3"/>
    <text class="mn" x="110" y="1100" filter="url(#ts)">Michael Eusebio</text>
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
      <filter id="tsh" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000" flood-opacity="0.35"/>
      </filter>
      <style type="text/css">
        ${isSocial ? `
        .st1{font-family:'Montserrat','Inter',sans-serif;font-weight:900;font-size:72px;fill:#fff;letter-spacing:-1.5px;}
        .sh{font-family:'Montserrat','Inter',sans-serif;font-weight:800;font-size:55px;fill:#fff;letter-spacing:-0.5px;}
        .st3{font-family:'Montserrat','Inter',sans-serif;font-weight:700;font-size:40px;fill:#fff;letter-spacing:-0.5px;}
        .mn{font-family:'Montserrat','Inter',sans-serif;font-weight:600;font-size:36px;fill:#fff;letter-spacing:-0.5px;}
        ` : `
        .o1{font-family:'Inter',sans-serif;font-weight:900;font-size:36px;fill:#fff;}
        .o2{font-family:'Inter',sans-serif;font-weight:700;font-size:48px;fill:#fff;}
        .o3{font-family:'Inter',sans-serif;font-weight:500;font-size:20px;fill:#fff;}
        .o4{font-family:'Inter',sans-serif;font-weight:700;font-size:18px;fill:#fff;}
        `}
      </style>
      <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0.0"/>
        <stop offset="30%" stop-color="#000" stop-opacity="0.05"/>
        <stop offset="55%" stop-color="#000" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.80"/>
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
  const W = 1080, H = 1350
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
