import { BaseConverter, type ConverterOptions, type ConversionResult } from '@shared/converters/core/base/BaseConverter'

export class WebpConverter extends BaseConverter {
  protected readonly supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp']
  protected readonly maxFileSize = 50 * 1024 * 1024 // 50MB
  protected readonly maxFiles = 10

  id = 'webp-converter'
  name = 'WebP Converter'
  formats = [
    {
      id: 'to-webp',
      name: 'Convert to WebP',
      inputTypes: this.supportedFormats,
      outputTypes: ['image/webp']
    }
  ]

  async convert(file: File, options: ConverterOptions): Promise<ConversionResult> {
    try {
      // Create an image element
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = objectUrl
      })

      // Create canvas with image dimensions
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Draw image on canvas
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(objectUrl)

      // Convert to blob with specified quality
      const quality = options.quality ?? 0.9
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) reject(new Error('Could not create WebP blob'))
            else resolve(blob)
          },
          'image/webp',
          quality
        )
      })

      // Generate output filename
      const fileName = `${file.name.split('.')[0]}.webp`

      return {
        blob,
        fileName
      }
    } catch (error) {
      return {
        blob: new Blob(),
        fileName: file.name,
        error: error instanceof Error ? error.message : 'WebP conversion failed'
      }
    }
  }

  validate(file: File): boolean {
    return this.supportedFormats.includes(file.type) && 
           !file.type.includes('webp') && // Don't convert if already WebP
           file.size <= this.maxFileSize
  }
} 