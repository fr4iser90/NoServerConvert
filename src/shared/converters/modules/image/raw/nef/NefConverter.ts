import { BaseConverter, type ConverterOptions, type ConversionResult } from '@shared/converters/core/base/BaseConverter'
import { Dcraw } from '@shared/converters/core/utils/dcraw'

export class NefConverter extends BaseConverter {
  protected readonly supportedFormats = ['image/x-nikon-nef']
  protected readonly maxFileSize = 100 * 1024 * 1024 // 100MB (RAW files are larger)
  protected readonly maxFiles = 5 // Fewer files due to processing intensity

  id = 'nef-converter'
  name = 'NEF Converter'
  formats = [
    {
      id: 'nef-to-jpg',
      name: 'NEF to JPG',
      inputTypes: this.supportedFormats,
      outputTypes: ['image/jpeg']
    },
    {
      id: 'nef-to-tiff',
      name: 'NEF to TIFF',
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

      // Read the NEF file
      const arrayBuffer = await file.arrayBuffer()
      
      // Convert using dcraw
      const result = await this.dcraw.convert(arrayBuffer, {
        format: options.format || 'jpg',
        quality: options.quality ?? 0.9,
        whiteBalance: options.whiteBalance ?? 'auto',
        demosaic: options.demosaic ?? 'vng',
        halfSize: options.halfSize ?? false,
        // Nikon-specific options
        nikonCompressed: true,
        useEmbeddedColorProfile: true
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
        error: error instanceof Error ? error.message : 'NEF conversion failed'
      }
    }
  }

  validate(file: File): boolean {
    return this.supportedFormats.includes(file.type) && 
           file.size <= this.maxFileSize
  }
} 