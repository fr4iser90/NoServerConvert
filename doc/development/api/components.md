# Component API Reference

## Overview

The component API provides reusable Vue components for the web application and browser extension. Components are organized by category and format, with common components shared between implementations.

## Common Components

### FileUpload
```typescript
interface FileUploadProps {
  accept: string[];
  multiple: boolean;
  maxSize: number;
  disabled: boolean;
}

interface FileUploadEmits {
  (e: 'update:files', files: File[]): void;
  (e: 'error', error: Error): void;
}
```

### ProgressBar
```typescript
interface ProgressBarProps {
  progress: number;
  status: 'idle' | 'converting' | 'complete' | 'error';
  showPercentage: boolean;
}

interface ProgressBarEmits {
  (e: 'cancel'): void;
}
```

### ErrorDisplay
```typescript
interface ErrorDisplayProps {
  error: string | null;
  showDetails: boolean;
}

interface ErrorDisplayEmits {
  (e: 'dismiss'): void;
  (e: 'retry'): void;
}
```

## Converter Components

### PDF Components

#### PdfConverter (Web)
```typescript
// Web implementation
import { PdfConverter } from '@web/components/converters/document/pdf';
```

#### PdfConverter (Extension)
```typescript
// Extension implementation
import { PdfConverter } from '@ext/components/converters/document/pdf';
```

#### PdfOptions (Web)
```typescript
import { PdfOptions } from '@web/components/converters/document/pdf/PdfOptions.vue';
```

### Image Components (Web)
```typescript
import { ImageConverter } from '@web/components/converters/image/ImageConverter.vue';
import { ImageOptions } from '@web/components/converters/image/ImageOptions.vue';
```

## Usage Examples

### Basic Component Usage (Web)
```vue
<template>
  <PdfConverter
    :default-format="'png'"
    :default-quality="0.8"
    :show-preview="true"
    @conversion:complete="handleComplete"
    @conversion:error="handleError"
  />
</template>

<script setup lang="ts">
import { PdfConverter } from '@web/components/converters/document/pdf';

const handleComplete = (results: ConversionResult[]) => {
  // Handle conversion results
};

const handleError = (error: Error) => {
  // Handle conversion error
};
</script>
```

### Component with Options (Web)
```vue
<template>
  <div>
    <FileUpload
      accept=".pdf"
      :multiple="true"
      :max-size="10 * 1024 * 1024"
      @update:files="handleFiles"
    />
    
    <PdfOptions
      v-model="options"
      :disabled="!hasFiles"
    />
    
    <ProgressBar
      :progress="progress"
      :status="status"
      @cancel="handleCancel"
    />
    
    <ErrorDisplay
      :error="error"
      :show-details="true"
      @retry="handleRetry"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePdfStore } from '@web/stores/converters/pdf';

const store = usePdfStore();
const options = ref<PdfConversionOptions>({
  format: 'png',
  quality: 0.8,
  dpi: 300
});

const hasFiles = computed(() => store.files.length > 0);
const progress = computed(() => store.progress);
const status = computed(() => store.isConverting ? 'converting' : 'idle');
const error = computed(() => store.error);

const handleFiles = (files: File[]) => {
  store.addFiles(files);
};

const handleCancel = () => {
  store.cancel();
};

const handleRetry = () => {
  store.convert(options.value);
};
</script>
```

## Component Integration

### With Stores (Web)
```vue
<template>
  <ImageConverter
    v-model:options="options"
    :files="store.files"
    :is-converting="store.isConverting"
    :progress="store.progress"
    :error="store.error"
    @convert="handleConvert"
    @cancel="store.cancel"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useImageStore } from '@web/stores/converters/image';
import { ImageConverter } from '@web/components/converters/image/ImageConverter.vue';

const store = useImageStore();
const options = ref<ImageConversionOptions>({
  format: 'webp',
  quality: 0.8,
  width: 800,
  height: 600
});

const handleConvert = async () => {
  await store.convert(options.value);
};
</script>
```

### With Converter API (Shared)
```vue
<template>
  <AudioConverter
    v-model:options="options"
    :converter="converter"
    @convert="handleConvert"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AudioConverter } from '@web/components/converters/audio/AudioConverter.vue';
import { AudioConverter as AudioConverterApi } from '@shared/converters/modules/audio/AudioConverter';

const converter = new AudioConverterApi();
const options = ref<AudioConversionOptions>({
  format: 'mp3',
  bitrate: 320,
  normalize: true
});

const handleConvert = async (file: File) => {
  const result = await converter.convert(file, options.value);
  // Handle result
};
</script>
```

## Best Practices

1. **Component Design**
   - Keep components focused and single-purpose
   - Use props for configuration
   - Emit events for state changes
   - Implement proper validation
   - Handle edge cases

2. **State Management**
   - Use stores for global state
   - Use props for component state
   - Use emits for state changes
   - Implement proper cleanup

3. **Performance**
   - Use lazy loading for large components
   - Implement proper caching
   - Optimize re-renders
   - Handle large files appropriately

4. **Accessibility**
   - Use semantic HTML
   - Implement proper ARIA attributes
   - Support keyboard navigation
   - Provide proper focus management

5. **Error Handling**
   - Implement proper error states
   - Provide user feedback
   - Handle edge cases
   - Log errors for debugging 