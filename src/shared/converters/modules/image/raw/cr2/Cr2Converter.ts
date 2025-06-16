import { BaseConverter, type ConverterOptions, type ConversionResult } from '@shared/converters/core/base/BaseConverter'
import { Dcraw } from '@shared/converters/core/utils/dcraw'

export class Cr2Converter extends BaseConverter {
  protected readonly supportedFormats = ['image/x-canon-cr2']
  protected readonly maxFileSize = 100 * 1024 * 1024 // 100MB (RAW files are larger)
  protected readonly maxFiles = 5 // Fewer files due to processing intensity

  id = 'cr2-converter'
  name = 'CR2 Converter'
  formats = [
    {
      id: 'cr2-to-jpg',
      name: 'CR2 to JPG',
      inputTypes: this.supportedFormats,
      outputTypes: ['image/jpeg']
    },
    {
      id: 'cr2-to-tiff',
      name: 'CR2 to TIFF',
      inputTypes: this.supportedFormats,
      outputTypes: ['image/tiff']
    }
  ]

  private dcraw: Dcraw

  constructor() {
    super()
    this.dcraw = new Dcraw()
  }

  async convert(file: File, options: ConverterOptions): Promise<ConversionResult> {
    try {
      // Initialize dcraw if not already done
      await this.dcraw.initialize()

      // Read the CR2 file
      const arrayBuffer = await file.arrayBuffer()
      
      // Convert using dcraw
      const result = await this.dcraw.convert(arrayBuffer, {
        format: options.format || 'jpg',
        quality: options.quality ?? 0.9,
        whiteBalance: options.whiteBalance ?? 'auto',
        demosaic: options.demosaic ?? 'vng',
        halfSize: options.halfSize ?? false
      })

      // Generate output filename
      const extension = options.format === 'tiff' ? 'tiff' : 'jpg'
      const fileName = `${file.name.split('.')[0]}.${extension}`

      return {
        blob: result.blob,
        fileName
      }
    } catch (error) {
      return {
        blob: new Blob(),
        fileName: file.name,
        error: error instanceof Error ? error.message : 'CR2 conversion failed'
      }
    }
  }

  validate(file: File): boolean {
    return this.supportedFormats.includes(file.type) && 
           file.size <= this.maxFileSize
  }
} 