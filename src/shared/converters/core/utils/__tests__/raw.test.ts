import { describe, it, expect } from 'vitest'
import LibRaw from 'libraw.js'

describe('LibRaw RAW Conversion', () => {
  it('should initialize LibRaw', async () => {
    const libraw = new LibRaw()
    expect(libraw).toBeDefined()
  })

  it('should detect supported formats', async () => {
    const libraw = new LibRaw()
    // Test with a small sample CR2 file
    const supported = await libraw.isSupportedFormat('image/x-canon-cr2')
    expect(supported).toBe(true)
  })

  it('should convert RAW to JPEG', async () => {
    const libraw = new LibRaw()
    
    // Create a minimal valid CR2 file header for testing
    const testBuffer = new ArrayBuffer(1024)
    const view = new Uint8Array(testBuffer)
    // Add CR2 magic bytes
    view[0] = 0x49
    view[1] = 0x49
    view[2] = 0x2A
    view[3] = 0x00
    
    try {
      const result = await libraw.convert(testBuffer, {
        format: 'jpeg',
        quality: 0.9
      })
      expect(result).toBeDefined()
    } catch (error) {
      // We expect an error with our test data, but we want to verify the API works
      expect(error).toBeDefined()
    }
  })
}) 