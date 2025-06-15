# Video Converter

## Features
- Format Conversion (MP4, WebM, GIF)
- Video Compression
- Basic Trimming
- Frame Extraction
- Resolution Change
- Batch Processing

## Implementation
- FFmpeg.wasm for video processing
- WebCodecs API for modern browsers
- Canvas API for preview
- Web Workers for processing

## Technical Details
- Supported Formats
  - Input: MP4, WebM, AVI, MOV, MKV
  - Output: MP4, WebM, GIF
- Size Limits
  - Max input size: Browser memory dependent
  - Recommended: < 500MB per video
- Quality Settings
  - Resolution options
  - Bitrate control
  - Codec selection
  - Frame rate options

## Performance Considerations
- Memory management
- Processing time
- Browser limitations
- Hardware acceleration
- Large file handling

## Browser Support
- Chrome: Full support
- Firefox: Limited support
- Safari: Basic support
- Edge: Full support

## Usage Examples
- Format conversion
- Video compression
- GIF creation
- Frame extraction
- Batch processing
- Resolution change 