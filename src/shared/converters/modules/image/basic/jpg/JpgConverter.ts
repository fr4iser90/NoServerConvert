import { BaseConverter, type ConverterOptions, type ConversionResult } from '@shared/converters/core/base/BaseConverter'

export class JpgConverter extends BaseConverter {
  protected readonly supportedFormats = ['image/png', 'image/webp', 'image/gif', 'image/bmp']
  protected readonly maxFileSize = 50 * 1024 * 1024 // 50MB
  protected readonly maxFiles = 10

  id = 'jpg-converter'
  name = 'JPG Converter'
  formats = [
    {
      id: 'to-jpg',
      name: 'Convert to JPG',
      inputTypes: this.supportedFormats,
      outputTypes: ['image/jpeg']
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
            if (!blob) reject(new Error('Could not create JPG blob'))
            else resolve(blob)
          },
          'image/jpeg',
          quality
        )
      })

      // Generate output filename
      const fileName = `${file.name.split('.')[0]}.jpg`

      return {
        blob,
        fileName
      }
    } catch (error) {
      return {
        blob: new Blob(),
        fileName: file.name,
        error: error instanceof Error ? error.message : 'JPG conversion failed'
      }
    }
  }

  validate(file: File): boolean {
    return this.supportedFormats.includes(file.type) && 
           !file.type.includes('jpeg') && // Don't convert if already JPG
           file.size <= this.maxFileSize
  }
} 