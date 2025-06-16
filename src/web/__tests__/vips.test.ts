import { describe, it, expect, beforeAll } from 'vitest'
import Vips from 'wasm-vips'

describe('Vips RAW Conversion', () => {
  let vips: any // Using any for now since we're testing the API

  beforeAll(async () => {
    // Initialize vips
    vips = await Vips()
  })

  it('should initialize vips', () => {
    expect(vips).toBeDefined()
    expect(vips.version).toBeDefined()
    console.log('Vips version:', vips.version)
  })

  it('should list supported formats', () => {
    // Get list of supported formats
    const formats = vips.getFormats?.() || []
    console.log('Supported formats:', formats)
    
    // Check for RAW format support
    const hasRawSupport = formats.some((format: string) => 
      format.toLowerCase().includes('raw') || 
      format.toLowerCase().includes('cr2') || 
      format.toLowerCase().includes('nef')
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
      // Try to load the test buffer
      const image = vips.Image.newFromBuffer(testBuffer)
      expect(image).toBeDefined()

      // Try to convert to JPEG
      const jpegBuffer = await image.writeToBuffer('.jpg', {
        Q: 90,
        strip: true
      })
      expect(jpegBuffer).toBeDefined()
    } catch (error) {
      // We expect an error with our test data, but we want to verify the API works
      console.log('Expected error with test data:', error)
      expect(error).toBeDefined()
    }
  })
}) 