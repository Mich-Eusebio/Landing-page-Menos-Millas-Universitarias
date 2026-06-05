import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDBINARY_CLOUDNAME,
  api_key: process.env.CLOUDBINARY_API_KEY,
  api_secret: process.env.CLOUDBINARY_API_SECRET,
})

const uploadCache = new Map()

export async function uploadAndGetBgRemovedUrl(source) {
  if (uploadCache.has(source)) return uploadCache.get(source)

  const result = await cloudinary.uploader.upload(source, {
    folder: 'sponsors',
  })

  const url = cloudinary.url(result.public_id, {
    transformation: [{ effect: 'background_removal' }],
    secure: true,
    fetch_format: 'png',
    quality: 'auto',
  })

  uploadCache.set(source, url)
  return url
}
