import dcraw from 'dcraw.js'

export interface DcrawOptions {
  format: 'jpg' | 'tiff'
  quality?: number
  whiteBalance?: 'auto' | 'camera' | 'daylight' | 'cloudy' | 'shade' | 'tungsten' | 'fluorescent'
  demosaic?: 'vng' | 'ppg' | 'ahd' | 'dcb' | 'dht' | 'aa' | 'linear'
  halfSize?: boolean
  nikonCompressed?: boolean
  useEmbeddedColorProfile?: boolean
}

export interface DcrawResult {
  blob: Blob
  metadata?: {
    width: number
    height: number
    bitsPerSample: number
    colorSpace: string
    make?: string
    model?: string
    exposureTime?: string
    fNumber?: number
    iso?: number
    focalLength?: number
  }
}

export class Dcraw {
  private initialized = false
  private worker: Worker | null = null

  async initialize(): Promise<void> {
    if (this.initialized) return

    // Initialize dcraw.js worker
    this.worker = await dcraw.createWorker()
    this.initialized = true
  }

  async convert(buffer: ArrayBuffer, options: DcrawOptions): Promise<DcrawResult> {
    if (!this.initialized || !this.worker) {
      throw new Error('Dcraw not initialized. Call initialize() first.')
    }

    try {
      // Set conversion options
      const conversionOptions = {
        format: options.format,
        quality: options.quality ?? 0.9,
        whiteBalance: options.whiteBalance ?? 'auto',
        demosaic: options.demosaic ?? 'vng',
        halfSize: options.halfSize ?? false,
        // Nikon-specific options
        nikonCompressed: options.nikonCompressed ?? false,
        useEmbeddedColorProfile: options.useEmbeddedColorProfile ?? true
      }

      // Convert RAW to desired format
      const result = await this.worker.convert(buffer, conversionOptions)

      return {
        blob: result.blob,
        metadata: result.metadata
      }
    } catch (error) {
      throw new Error(`RAW conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
      this.initialized = false
    }
  }
} 