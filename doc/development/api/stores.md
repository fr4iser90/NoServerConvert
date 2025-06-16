# Store API Reference

## Overview

The store API provides state management for the application using Pinia. Each converter has its own store that manages its state, actions, and interactions with the converter API.

## Core Store Structure

### BaseConverterStore
```typescript
interface BaseConverterStore {
  // State
  files: File[];
  isConverting: boolean;
  progress: number;
  error: string | null;
  results: ConversionResult[];
  
  // Actions
  addFiles(files: File[]): void;
  removeFile(file: File): void;
  clearFiles(): void;
  
  // Conversion
  convert(options: ConversionOptions): Promise<void>;
  convertBatch(options: ConversionOptions): Promise<void>;
  cancel(): void;
  
  // Getters
  readonly canConvert: boolean;
  readonly totalFiles: number;
  readonly hasError: boolean;
}
```

## Converter Stores

### PdfStore
```typescript
interface PdfStore extends BaseConverterStore {
  // PDF-specific state
  selectedPage: number;
  allPages: boolean;
  dpi: number;
  
  // PDF-specific actions
  setPage(page: number): void;
  setAllPages(all: boolean): void;
  setDpi(dpi: number): void;
  
  // PDF-specific conversions
  toImage(options: PdfToImageOptions): Promise<void>;
  toText(options: PdfToTextOptions): Promise<void>;
  toHtml(options: PdfToHtmlOptions): Promise<void>;
}
```

### ImageStore
```typescript
interface ImageStore extends BaseConverterStore {
  // Image-specific state
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  
  // Image-specific actions
  setDimensions(width: number, height: number): void;
  setAspectRatio(maintain: boolean): void;
  
  // Image-specific conversions
  resize(options: ResizeOptions): Promise<void>;
  compress(options: CompressOptions): Promise<void>;
}
```

### AudioStore
```typescript
interface AudioStore extends BaseConverterStore {
  // Audio-specific state
  bitrate: number;
  normalize: boolean;
  trim: boolean;
  
  // Audio-specific actions
  setBitrate(bitrate: number): void;
  setNormalize(normalize: boolean): void;
  setTrim(trim: boolean): void;
  
  // Audio-specific conversions
  normalize(options: NormalizeOptions): Promise<void>;
  extractMetadata(): Promise<AudioMetadata[]>;
}
```

### VideoStore
```typescript
interface VideoStore extends BaseConverterStore {
  // Video-specific state
  quality: string;
  resolution: string;
  codec: string;
  
  // Video-specific actions
  setQuality(quality: string): void;
  setResolution(resolution: string): void;
  setCodec(codec: string): void;
  
  // Video-specific conversions
  compress(options: CompressOptions): Promise<void>;
  extractAudio(options: ExtractAudioOptions): Promise<void>;
}
```

## Usage Examples

### Basic Store Usage
```typescript
// In a Vue component
import { usePdfStore } from '@web/stores/converters/pdf';
import { PdfConverter } from '@shared/converters/modules/document/pdf';

const pdfStore = usePdfStore();

// Add files
pdfStore.addFiles(files);

// Set options
pdfStore.setPage(1);
pdfStore.setDpi(300);

// Convert
await pdfStore.toImage({
  format: 'png',
  quality: 0.8
});

// Handle results
if (pdfStore.hasError) {
  console.error(pdfStore.error);
} else {
  // Use converted files
  const results = pdfStore.results;
}
```

### Batch Processing
```typescript
const imageStore = useImageStore();

// Add multiple files
imageStore.addFiles(files);

// Set batch options
imageStore.setDimensions(800, 600);
imageStore.setAspectRatio(true);

// Convert all files
await imageStore.resize({
  format: 'webp',
  quality: 0.8
});

// Track progress
watch(() => imageStore.progress, (progress) => {
  console.log(`Progress: ${progress}%`);
});
```

### Error Handling
```typescript
const audioStore = useAudioStore();

try {
  await audioStore.normalize({
    format: 'mp3',
    bitrate: 320
  });
} catch (error) {
  // Handle store error
  console.error('Store error:', error);
}

// Check for conversion errors
if (audioStore.hasError) {
  // Handle conversion error
  console.error('Conversion error:', audioStore.error);
}
```

## Store Integration

### With Vue Components
```typescript
// Component setup
const store = useConverterStore();

// Reactive state
const files = computed(() => store.files);
const isConverting = computed(() => store.isConverting);
const progress = computed(() => store.progress);

// Actions
const handleFiles = (newFiles: File[]) => {
  store.addFiles(newFiles);
};

const startConversion = async () => {
  if (store.canConvert) {
    await store.convert(options);
  }
};
```

### With Converter API
```typescript
// Store implementation
export const useConverterStore = defineStore('converter', {
  state: () => ({
    converter: new PdfConverter(),
    // ... other state
  }),
  
  actions: {
    async convert(options: ConversionOptions) {
      this.isConverting = true;
      try {
        const result = await this.converter.convert(this.files[0], options);
        this.results.push(result);
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isConverting = false;
      }
    }
  }
});
```

## Best Practices

1. **State Management**
   - Keep state minimal and necessary
   - Use computed properties for derived state
   - Implement proper error handling
   - Clean up state after use

2. **Performance**
   - Use batch processing for multiple files
   - Implement proper cleanup
   - Monitor memory usage
   - Handle large files appropriately

3. **Error Handling**
   - Implement proper error states
   - Provide user feedback
   - Log errors for debugging
   - Handle edge cases

4. **Type Safety**
   - Use TypeScript interfaces
   - Define proper types for all state
   - Implement proper validation
   - Use strict mode 