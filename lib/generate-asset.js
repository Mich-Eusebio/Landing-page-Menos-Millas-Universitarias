import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import nunjucks from 'nunjucks'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

let browserPromise = null

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      args: chromium.args,
      defaultViewport: null,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
  }
  return browserPromise
}

async function renderTemplate(templateName, data) {
  const templatePath = join(process.cwd(), 'templates', templateName)
  const template = await readFile(templatePath, 'utf-8')
  return nunjucks.renderString(template, data)
}

async function captureScreenshot(html, width, height) {
  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    await page.setViewport({ width, height })
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })
    const buffer = await page.screenshot({ type: 'png' })
    return buffer
  } finally {
    await page.close()
  }
}

export async function generateSocialPost({ day, sponsorPhotoUrl, baseUrl }) {
  const html = await renderTemplate('social-post.njk', {
    day,
    sponsorPhotoUrl,
    michaelPhotoUrl: `${baseUrl}/EXCELENTE%20FOTO%20M%C3%8DA.png`,
    campusBg: `${baseUrl}/campus_background.png`,
  })
  return captureScreenshot(html, 1080, 1920)
}

export async function generateOgImage({ day, sponsorPhotoUrl, baseUrl }) {
  const html = await renderTemplate('og-image.njk', {
    day,
    sponsorPhotoUrl,
    michaelPhotoUrl: `${baseUrl}/EXCELENTE%20FOTO%20M%C3%8DA.png`,
    campusBg: `${baseUrl}/campus_background.png`,
  })
  return captureScreenshot(html, 1200, 630)
}

export async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise
    await browser.close()
    browserPromise = null
  }
}
