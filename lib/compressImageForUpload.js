const DEFAULT_MAX_BYTES = 900 * 1024

export function compressImageForUpload(file, options = {}) {
  const {
    maxBytes = DEFAULT_MAX_BYTES,
    maxDimension = 1200,
    quality = 0.75,
  } = options

  if (!file || !file.type?.startsWith('image/') || file.type === 'image/gif' || file.size <= maxBytes) {
    return Promise.resolve(file)
  }

  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))

        const context = canvas.getContext('2d')
        if (!context) {
          resolve(file)
          return
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file)
            return
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '')
          resolve(new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          }))
        }, 'image/webp', quality)
      }

      image.onerror = () => resolve(file)
      image.src = String(reader.result)
    }

    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}
