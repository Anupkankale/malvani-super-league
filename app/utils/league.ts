// Browser-only helpers. Types, constants and validation live in shared/utils/league.ts.

// Paths are relative to the page; hash routing keeps the document at the app root.
export const LOGO = 'logo.png'
export const HERO_BG = 'hero-bg.jpg'
export const MOTTO = 'Play hard. Play together. Win as one.'
export const NAME_MR = 'मालवणी सुपर लीग'

export const REDUCED =
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const fmt = (n: unknown) => Number(n || 0).toLocaleString('en-IN')

export const photoKB = (dataUrl: string) => Math.round((dataUrl.length * 0.75) / 1024)

/** Crops a photo to 3:4 and re-encodes it as a JPEG data URL under PHOTO_MAX_BYTES. */
export function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) return reject(new Error("That file isn't a photo. Choose a JPG or PNG."))
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Couldn't read that photo. Try another one."))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("Couldn't open that photo. Try another one."))
      img.onload = () => {
        let w = Math.min(img.width, img.height * 0.75)
        let h = w / 0.75
        if (h > img.height) {
          h = img.height
          w = h * 0.75
        }
        const sx = (img.width - w) / 2
        const sy = Math.max(0, ((img.height - h) / 2) * 0.5)
        let out = ''
        let width = 720
        for (let pass = 0; pass < 6; pass++) {
          const c = document.createElement('canvas')
          c.width = Math.round(width)
          c.height = Math.round(width / 0.75)
          const ctx = c.getContext('2d')!
          ctx.fillStyle = '#1E0A06'
          ctx.fillRect(0, 0, c.width, c.height)
          ctx.drawImage(img, sx, sy, w, h, 0, 0, c.width, c.height)
          out = c.toDataURL('image/jpeg', pass < 2 ? 0.82 : 0.72 - pass * 0.05)
          if (out.length * 0.75 <= PHOTO_MAX_BYTES) break
          width *= 0.82
        }
        if (out.length * 0.75 > PHOTO_MAX_BYTES)
          return reject(new Error('That photo is too large even after shrinking. Try another one.'))
        resolve(out)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

/** Input handler helper: strips non-digits from the field in place and returns the result. */
export function digitsOnly(e: Event) {
  const input = e.target as HTMLInputElement
  input.value = input.value.replace(/\D/g, '')
  return input.value
}
