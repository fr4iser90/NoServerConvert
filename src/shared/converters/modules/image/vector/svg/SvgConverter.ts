import { BaseConverter, type ConverterOptions, type ConversionResult } from '@shared/converters/core/base/BaseConverter'

export class SvgConverter extends BaseConverter {
  protected readonly supportedFormats = ['image/svg+xml']
  protected readonly maxFileSize = 10 * 1024 * 1024 // 10MB (SVG files are usually smaller)
  protected readonly maxFiles = 10

  id = 'svg-converter'
  name = 'SVG Converter'
  formats = [
    {
      id: 'svg-to-png',
      name: 'Convert to PNG',
      inputTypes: this.supportedFormats,
      outputTypes: ['image/png']
    },
    {
      id: 'svg-to-jpg',
      name: 'Convert to JPG',
      inputTypes: this.supportedFormats,
      outputTypes: ['image/jpeg']
    },
    {
      id: 'svg-to-webp',
      name: 'Convert to WebP',
      inputTypes: this.supportedFormats,
      outputTypes: ['image/webp']
    }
  ]

  async convert(file: File, options: ConverterOptions): Promise<ConversionResult> {
    try {
      // Read SVG content
      const svgText = await file.text()
      
      // Create an image element
      const img = new Image()
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' })
      const objectUrl = URL.createObjectURL(svgBlob)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = objectUrl
      })

      // Get target format from options
      const targetFormat = options.format || 'png'
      const mimeType = `image/${targetFormat}`
      
      // Create canvas with SVG dimensions
      const canvas = document.createElement('canvas')
      canvas.width = img.width || 800  // Default width if not specified
      canvas.height = img.height || 600 // Default height if not specified
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Draw SVG on canvas
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(objectUrl)

      // Convert to blob with specified quality
      const quality = options.quality ?? 0.9
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) reject(new Error(`Could not create ${targetFormat.toUpperCase()} blob`))
            else resolve(blob)
          },
          mimeType,
          quality
        )
      })

      // Generate output filename
      const extension = targetFormat === 'jpeg' ? 'jpg' : targetFormat
      const fileName = `${file.name.split('.')[0]}.${extension}`

      return {
        blob,
        fileName
      }
    } catch (error) {
      return {
        blob: new Blob(),
        fileName: file.name,
        error: error instanceof Error ? error.message : 'SVG conversion failed'
      }
    }
  }

  validate(file: File): boolean {
    return this.supportedFormats.includes(file.type) && 
           file.size <= this.maxFileSize
  }
} 