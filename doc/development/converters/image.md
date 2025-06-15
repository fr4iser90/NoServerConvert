# Image Converter

## Features
- Format Conversion (JPG, PNG, WebP, GIF)
- Image Compression
- Resizing
- Basic Editing (Crop, Rotate)
- Batch Processing
- Metadata Handling

## Implementation
- Sharp.js for image manipulation
- Browser Canvas API for preview
- WebP conversion tools
- EXIF handling

## Technical Details
- Supported Formats
  - Input: JPG, PNG, WebP, GIF, BMP, TIFF
  - Output: JPG, PNG, WebP, GIF
- Size Limits
  - Max input size: Browser memory dependent
  - Recommended: < 50MB per image
- Quality Settings
  - Compression levels
  - Format-specific options
  - Metadata preservation

## Performance Considerations
- Memory usage optimization
- Progressive loading
- Web Worker processing
- Browser compatibility
- Large file handling

## Usage Examples
- Single image conversion
- Batch processing
- Format optimization
- Size reduction
- Metadata editing 