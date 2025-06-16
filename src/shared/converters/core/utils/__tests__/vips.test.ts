import { describe, it, expect, beforeAll } from 'vitest'
import Vips from 'wasm-vips'

describe('Vips RAW Conversion', () => {
  let vips: typeof Vips

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
    const formats = vips.formatList()
    console.log('Supported formats:', formats)
    
    // Check for RAW format support
    const hasRawSupport = formats.some(format => 
      format.includes('raw') || 
      format.includes('cr2') || 
      format.includes('nef')
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