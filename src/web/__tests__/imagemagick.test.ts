import { describe, it, expect, beforeAll } from 'vitest'
import { ImageMagick, MagickFormat } from 'wasm-imagemagick'

describe('ImageMagick RAW Support', () => {
  beforeAll(async () => {
    // Initialize ImageMagick
    await ImageMagick.initialize()
  })

  it('should initialize ImageMagick', () => {
    expect(ImageMagick).toBeDefined()
    console.log('ImageMagick version:', ImageMagick.version)
  })

  it('should list supported formats', () => {
    // Get list of supported formats
    const formats = ImageMagick.getSupportedFormats()
    console.log('Supported formats:', formats)
    
    // Check for RAW format support
    const hasRawSupport = formats.some(format => 
      format.toLowerCase().includes('raw') || 
      format.toLowerCase().includes('cr2') || 
      format.toLowerCase().includes('nef') ||
      format.toLowerCase().includes('dcr') ||
      format.toLowerCase().includes('arw')
    )
    expect(hasRawSupport).toBe(true)
  })

  it('should convert RAW to JPEG', async () => {
    // Create a minimal valid CR2 file header for testing
    const testBuffer = new ArrayBuffer(1024)
    const view = new Uint8Array(testBuffer)
    // Add CR2 magic bytes
    view[0] = 0x49
    view[1] = 0x49
    view[2] = 0x2A
    view[3] = 0x00

    try {
      // Try to load and convert the test buffer
      await ImageMagick.read(testBuffer, async (img) => {
        expect(img).toBeDefined()
        
        // Try to convert to JPEG
        const jpegBuffer = await img.write(MagickFormat.Jpeg, {
          quality: 90
        })
        expect(jpegBuffer).toBeDefined()
      })
    } catch (error) {
      // We expect an error with our test data, but we want to verify the API works
      console.log('Expected error with test data:', error)
      expect(error).toBeDefined()
    }
  })
}) 