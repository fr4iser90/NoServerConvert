# Converter Implementation Template

## Overview
Dieses Template beschreibt die korrekte Implementierung eines neuen Converters für das NoServerConvert System.

## Directory Structure
```
src/
├── shared/converters/modules/[category]/[format]/
│   ├── [Format]Converter.ts    # Core converter logic
│   ├── types.ts               # Format-specific types
│   └── utils.ts              # Format-specific utilities
│
├── web/components/converters/[category]/[format]/
│   ├── ConversionOptions.vue  # Format-specific options
│   └── Preview.vue           # Optional preview component
│
├── web/stores/converters/[format].ts
│   └── use[Format]Store      # Web-specific state management
│
└── extension/components/converters/[category]/[format]/
    └── ConversionOptions.vue  # Extension-specific options
```

## Implementation Steps

### 1. Shared Code (src/shared/converters/modules/[category]/[format]/)

#### A. Types (types.ts)
```typescript
// Format-specific types
interface [Format]Options {
  // Format-specific options
  quality?: number;
  format?: string;
  // ... other options
}

interface [Format]Result {
  // Format-specific result
  blob: Blob;
  fileName: string;
  error?: string;
  // ... other result data
}
```

#### B. Core Converter ([Format]Converter.ts)
```typescript
import { BaseConverter } from '../../core/base/BaseConverter';
import type { [Format]Options, [Format]Result } from './types';

export class [Format]Converter extends BaseConverter {
  // Required BaseConverter implementation
  id = '[format]-converter';
  name = '[Format] Converter';
  formats = [
    {
      id: '[format]-to-[target]',
      name: '[Format] to [Target]',
      inputTypes: ['[mime/type]'],
      outputTypes: ['[mime/type]']
    }
  ];

  // Format-specific implementation
  async convert(
    file: File, 
    options: [Format]Options
  ): Promise<[Format]Result> {
    // 1. Validate input
    // 2. Process file
    // 3. Return result
  }

  // Optional: Format-specific validation
  validate(file: File): boolean {
    // Custom validation logic
  }
}
```

### 2. Web Implementation

#### A. Store (web/stores/converters/[format].ts)
```typescript
import { defineStore } from 'pinia';
import { [Format]Converter } from '@shared/converters/modules/[category]/[format]/[Format]Converter';

export const use[Format]Store = defineStore('[format]', {
  state: () => ({
    // Web-specific state
    selectedFiles: [] as File[],
    options: {} as [Format]Options,
    error: null as string | null,
    // ... other state
  }),

  actions: {
    // Web-specific actions
    async convertFiles() {
      const converter = new [Format]Converter();
      // Use shared converter
    }
  }
});
```

#### B. Components (web/components/converters/[category]/[format]/)

##### ConversionOptions.vue
```vue
<template>
  <!-- Format-specific options UI -->
</template>

<script setup lang="ts">
import { use[Format]Store } from '@web/stores/converters/[format]';
// Use store for state management
</script>
```

### 3. Extension Implementation

#### A. Components (extension/components/converters/[category]/[format]/)

##### ConversionOptions.vue
```vue
<template>
  <!-- Extension-specific options UI -->
</template>

<script setup lang="ts">
// Extension-specific logic
</script>
```

## Integration Points

### 1. Shared Code
- ✅ Extends BaseConverter
- ✅ Implements required interfaces
- ✅ Uses shared types
- ✅ No UI dependencies
- ✅ No framework dependencies

### 2. Web Code
- ✅ Uses shared converter
- ✅ Manages state in store
- ✅ UI components only
- ✅ Uses Vue 3 + TypeScript
- ✅ Follows web architecture

### 3. Extension Code
- ✅ Uses shared converter
- ✅ Extension-specific UI
- ✅ Browser API integration
- ✅ Follows extension architecture

## Testing Requirements

### 1. Shared Code
- [ ] Unit tests for converter
- [ ] Format validation tests
- [ ] Error handling tests
- [ ] Performance tests

### 2. Web Code
- [ ] Store tests
- [ ] Component tests
- [ ] Integration tests
- [ ] UI tests

### 3. Extension Code
- [ ] Component tests
- [ ] Browser API tests
- [ ] Integration tests

## Documentation Requirements

### 1. Shared Code
- [ ] Format specifications
- [ ] API documentation
- [ ] Usage examples
- [ ] Performance notes

### 2. Web Code
- [ ] Component documentation
- [ ] Store documentation
- [ ] UI/UX guidelines
- [ ] Integration guide

### 3. Extension Code
- [ ] Component documentation
- [ ] Browser API usage
- [ ] Integration guide

## Checklist

### Before Implementation
- [ ] Format research
- [ ] Browser support check
- [ ] Performance requirements
- [ ] Memory requirements
- [ ] Security considerations

### During Implementation
- [ ] Follow directory structure
- [ ] Use shared code
- [ ] Implement all interfaces
- [ ] Add error handling
- [ ] Add progress tracking
- [ ] Add memory management

### After Implementation
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Performance verified
- [ ] Memory usage checked
- [ ] Security reviewed
- [ ] Code reviewed 