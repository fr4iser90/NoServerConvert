# Converter API Reference

## Overview

The converter API provides a unified interface for file conversion operations. All converters are built on top of the base converter class and implement specific format conversions.

## Core Interfaces

### BaseConverter

```typescript
interface BaseConverter {
  // File handling
  validateFile(file: File): Promise<boolean>;
  getFileInfo(file: File): Promise<FileInfo>;
  
  // Conversion methods
  convert(file: File, options: ConversionOptions): Promise<ConversionResult>;
  convertBatch(files: File[], options: ConversionOptions): Promise<ConversionResult[]>;
  
  // Progress tracking
  onProgress(callback: (progress: number) => void): void;
  
  // Error handling
  onError(callback: (error: ConversionError) => void): void;
}
```

### FileInfo
```typescript
interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  format: string;
  isValid: boolean;
  error?: string;
}
```

### ConversionOptions
```typescript
interface ConversionOptions {
  // Common options
  format: string;
  quality?: number;
  compression?: boolean;
  
  // Format-specific options
  [key: string]: any;
}
```

### ConversionResult
```typescript
interface ConversionResult {
  file: File;
  output: Blob;
  format: string;
  size: number;
  duration?: number;
  error?: string;
}
```

## Available Converters

### PDF Converter
```typescript
interface PdfConverter extends BaseConverter {
  // PDF-specific methods
  toImage(file: File, options: PdfToImageOptions): Promise<ConversionResult>;
  toText(file: File, options: PdfToTextOptions): Promise<ConversionResult>;
  toHtml(file: File, options: PdfToHtmlOptions): Promise<ConversionResult>;
}
```

### Image Converter
```typescript
interface ImageConverter extends BaseConverter {
  // Image-specific methods
  resize(file: File, options: ResizeOptions): Promise<ConversionResult>;
  compress(file: File, options: CompressOptions): Promise<ConversionResult>;
}
```

### Audio Converter
```typescript
interface AudioConverter extends BaseConverter {
  // Audio-specific methods
  extractMetadata(file: File): Promise<AudioMetadata>;
  normalize(file: File, options: NormalizeOptions): Promise<ConversionResult>;
}
```

### Video Converter
```typescript
interface VideoConverter extends BaseConverter {
  // Video-specific methods
  extractAudio(file: File, options: ExtractAudioOptions): Promise<ConversionResult>;
  compress(file: File, options: CompressOptions): Promise<ConversionResult>;
}
```

## Usage Examples

### Basic Conversion
```typescript
// Create converter instance
import { PdfConverter } from '@shared/converters/modules/document/pdf';
const pdfConverter = new PdfConverter();

// Convert single file
const result = await pdfConverter.convert(file, {
  format: 'png',
  quality: 0.8
});

// Handle result
if (result.error) {
  console.error(result.error);
} else {
  // Use converted file
  const convertedFile = new File([result.output], 'converted.png');
}
```

### Batch Conversion
```typescript
// Convert multiple files
const results = await pdfConverter.convertBatch(files, {
  format: 'png',
  quality: 0.8
});

// Track progress
pdfConverter.onProgress((progress) => {
  console.log(`Progress: ${progress}%`);
});

// Handle errors
pdfConverter.onError((error) => {
  console.error('Conversion error:', error);
});
```

### Format-Specific Options

#### PDF to Image
```typescript
const options: PdfToImageOptions = {
  format: 'png',
  quality: 0.8,
  dpi: 300,
  page: 1,  // Convert specific page
  allPages: false  // Convert all pages
};
```

#### Image Processing
```typescript
const options: ResizeOptions = {
  width: 800,
  height: 600,
  maintainAspectRatio: true,
  format: 'webp'
};
```

#### Audio Processing
```typescript
const options: NormalizeOptions = {
  format: 'mp3',
  bitrate: 320,
  normalize: true,
  trim: true
};
```

#### Video Processing
```typescript
const options: CompressOptions = {
  format: 'mp4',
  quality: 'high',
  resolution: '1080p',
  codec: 'h264'
};
```

## Error Handling

### ConversionError
```typescript
interface ConversionError {
  code: string;
  message: string;
  details?: any;
  file?: File;
}
```

Common error codes:
- `INVALID_FILE`: File format not supported
- `SIZE_LIMIT`: File too large
- `PROCESSING_ERROR`: Conversion failed
- `MEMORY_ERROR`: Insufficient memory
- `FORMAT_ERROR`: Invalid format options

## Best Practices

1. **File Validation**
   - Always validate files before conversion
   - Check file size limits
   - Verify format support

2. **Memory Management**
   - Use batch processing for multiple files
   - Monitor memory usage
   - Clean up resources after conversion

3. **Error Handling**
   - Implement proper error handling
   - Provide user feedback
   - Log errors for debugging

4. **Progress Tracking**
   - Show conversion progress
   - Handle cancellation
   - Update UI accordingly

## Browser Support

- Modern browsers with WebAssembly support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance Considerations

- Use Web Workers for heavy processing
- Implement chunked file handling
- Monitor memory usage
- Clean up resources
- Handle large files appropriately

### Store Integration
```typescript
// Store implementation
import { PdfConverter } from '@shared/converters/modules/document/pdf';
import { useConverterStore } from '@web/stores/converters/pdf';

export const useConverterStore = defineStore('converter', {
  state: () => ({
    converter: new PdfConverter(),
    // ... other state
  }),
  
  // ... existing code ... 