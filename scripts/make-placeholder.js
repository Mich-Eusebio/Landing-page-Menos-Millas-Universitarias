import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2a4a7f"/>
      <stop offset="0.5" stop-color="#5b8fb9"/>
      <stop offset="1" stop-color="#b6cce0"/>
    </linearGradient>
    <radialGradient id="r" cx="0.35" cy="0.3" r="0.7">
      <stop offset="0" stop-color="rgba(255,255,255,0.4)"/>
      <stop offset="1" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <rect width="600" height="600" fill="url(#r)"/>
  <g transform="translate(300,260)" fill="rgba(255,255,255,0.85)">
    <circle cx="0" cy="0" r="80"/>
    <path d="M -120 220 Q -120 130 0 130 Q 120 130 120 220 Z"/>
  </g>
</svg>`

const buf = await sharp(Buffer.from(svg)).png().toBuffer()
const out = join(process.cwd(), 'public', 'sponsor-placeholder.png')
writeFileSync(out, buf)
console.log('Wrote', out, buf.length, 'bytes')
