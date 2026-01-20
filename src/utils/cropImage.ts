export type Area = {
  width: number
  height: number
  x: number
  y: number
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', error => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

/**
 * Crop + resize image
 * @param imageSrc base64 / url
 * @param pixelCrop area from react-easy-crop
 * @param size output size (default 512)
 * @param returnBlob true = Blob, false = base64
 */
export async function cropImage(
  imageSrc: string,
  pixelCrop: Area,
  size = 512,
  returnBlob = false
): Promise<string | Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new Error('Canvas context not available')

  canvas.width = size
  canvas.height = size

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  )

  if (returnBlob) {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) reject(new Error('Canvas is empty'))
        else resolve(blob)
      }, 'image/jpeg', 0.9)
    })
  }

  return canvas.toDataURL('image/jpeg', 0.9)
}