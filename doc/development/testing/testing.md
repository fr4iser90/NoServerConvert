# Testing Guide

## Overview

NoServerConvert uses a comprehensive testing strategy to ensure reliability and quality. The testing suite includes unit tests, integration tests, and end-to-end tests, implemented using Vitest and Cypress.

## Test Structure

```
tests/
├── shared/                  # Shared code tests
│   └── converters/         # Converter tests (shared between web and extension)
├── web/                    # Web app tests
│   ├── stores/            # Store tests (Pinia)
│   ├── components/        # Component tests (Vue)
│   └── integration/       # Web-specific integration tests
├── extension/             # Extension tests
│   ├── stores/           # Extension store tests
│   ├── components/       # Extension component tests
│   └── integration/      # Extension-specific integration tests
└── e2e/                  # End-to-end tests
    ├── web/             # Web app tests
    └── extension/       # Extension tests
```

## Unit Tests

### Shared Converter Tests

```typescript
// tests/shared/converters/pdf.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { PdfConverter } from '@shared/converters/modules/document/pdf';

describe('PdfConverter', () => {
  let converter: PdfConverter;
  
  beforeEach(() => {
    converter = new PdfConverter();
  });
  
  describe('validateFile', () => {
    it('should validate PDF files', async () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      const isValid = await converter.validateFile(file);
      expect(isValid).toBe(true);
    });
    
    it('should reject non-PDF files', async () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const isValid = await converter.validateFile(file);
      expect(isValid).toBe(false);
    });
  });
  
  describe('convert', () => {
    it('should convert PDF to image', async () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      const result = await converter.convert(file, {
        format: 'png',
        quality: 0.8
      });
      
      expect(result.error).toBeUndefined();
      expect(result.format).toBe('png');
      expect(result.output).toBeInstanceOf(Blob);
    });
  });
});
```

### Web Store Tests

```typescript
// tests/web/stores/pdf.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePdfStore } from '@web/stores/converters/pdf';

describe('PdfStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  
  describe('state', () => {
    it('should initialize with default values', () => {
      const store = usePdfStore();
      expect(store.files).toEqual([]);
      expect(store.isConverting).toBe(false);
      expect(store.error).toBeNull();
    });
  });
  
  describe('actions', () => {
    it('should add files', () => {
      const store = usePdfStore();
      const file = new File([''], 'test.pdf');
      store.addFiles([file]);
      expect(store.files).toContain(file);
    });
    
    it('should handle conversion', async () => {
      const store = usePdfStore();
      const file = new File([''], 'test.pdf');
      store.addFiles([file]);
      
      await store.convert({ format: 'png' });
      expect(store.isConverting).toBe(false);
      expect(store.results.length).toBeGreaterThan(0);
    });
  });
});
```

### Web Component Tests

```typescript
// tests/web/components/PdfConverter.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { PdfConverter } from '@web/components/converters/document/pdf';

describe('PdfConverter', () => {
  it('should render correctly', () => {
    const wrapper = mount(PdfConverter, {
      props: {
        defaultFormat: 'png',
        defaultQuality: 0.8
      }
    });
    
    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
    expect(wrapper.find('.options-panel').exists()).toBe(true);
  });
  
  it('should emit events on conversion', async () => {
    const wrapper = mount(PdfConverter);
    const file = new File([''], 'test.pdf');
    
    await wrapper.vm.handleFile(file);
    await wrapper.vm.startConversion();
    
    expect(wrapper.emitted('conversion:start')).toBeTruthy();
    expect(wrapper.emitted('conversion:complete')).toBeTruthy();
  });
});
```

### Extension Component Tests

```typescript
// tests/extension/components/PdfConverter.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { PdfConverter } from '@ext/components/converters/document/pdf';

describe('PdfConverter', () => {
  it('should render popup correctly', () => {
    const wrapper = mount(PdfConverter, {
      props: {
        defaultFormat: 'png',
        defaultQuality: 0.8
      }
    });
    
    expect(wrapper.find('.popup-container').exists()).toBe(true);
    expect(wrapper.find('.options-panel').exists()).toBe(true);
  });
});
```

## Integration Tests

### Web Converter-Store Integration

```typescript
// tests/web/integration/converter-store/pdf.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { PdfConverter } from '@shared/converters/modules/document/pdf';
import { usePdfStore } from '@web/stores/converters/pdf';

describe('PdfConverter-Store Integration', () => {
  let converter: PdfConverter;
  let store: ReturnType<typeof usePdfStore>;
  
  beforeEach(() => {
    setActivePinia(createPinia());
    converter = new PdfConverter();
    store = usePdfStore();
  });
  
  it('should handle conversion flow', async () => {
    const file = new File([''], 'test.pdf');
    store.addFiles([file]);
    
    // Simulate store using converter
    const result = await converter.convert(file, {
      format: 'png',
      quality: 0.8
    });
    
    store.results.push(result);
    expect(store.results[0].format).toBe('png');
  });
});
```

### Web Store-Component Integration

```typescript
// tests/web/integration/store-component/pdf.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { PdfConverter } from '@web/components/converters/document/pdf';
import { usePdfStore } from '@web/stores/converters/pdf';

describe('PdfStore-Component Integration', () => {
  it('should update component state from store', async () => {
    setActivePinia(createPinia());
    const store = usePdfStore();
    const wrapper = mount(PdfConverter);
    
    const file = new File([''], 'test.pdf');
    store.addFiles([file]);
    
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.file-list').text()).toContain('test.pdf');
  });
});
```

## End-to-End Tests

### Web App Tests

```typescript
// tests/e2e/web/pdf.spec.ts
import { describe, it, expect } from 'cypress';

describe('PDF Converter', () => {
  it('should convert PDF to image', () => {
    cy.visit('/converters/pdf');
    
    // Upload file
    cy.get('input[type="file"]').attachFile('test.pdf');
    
    // Set options
    cy.get('[data-test="format-select"]').select('png');
    cy.get('[data-test="quality-slider"]').invoke('val', 80);
    
    // Start conversion
    cy.get('[data-test="convert-button"]').click();
    
    // Check result
    cy.get('[data-test="result-list"]')
      .should('contain', 'test.png')
      .and('contain', 'Conversion complete');
  });
});
```

### Extension Tests

```typescript
// tests/e2e/extension/pdf.spec.ts
import { describe, it, expect } from 'cypress';

describe('PDF Converter Extension', () => {
  it('should convert PDF from context menu', () => {
    // Load extension
    cy.loadExtension();
    
    // Open context menu
    cy.get('body').rightclick();
    cy.get('[data-test="convert-pdf"]').click();
    
    // Check popup
    cy.get('[data-test="converter-popup"]')
      .should('be.visible')
      .and('contain', 'PDF Converter');
  });
});
```

## Test Data

### Test Files
- Small test files (< 1MB) for unit tests
- Medium test files (1-10MB) for integration tests
- Large test files (> 10MB) for performance tests

### Mock Data
```typescript
// tests/utils/mockData.ts
export const mockPdfFile = new File([''], 'test.pdf', {
  type: 'application/pdf'
});

export const mockConversionOptions = {
  format: 'png',
  quality: 0.8,
  dpi: 300
};

export const mockConversionResult = {
  file: mockPdfFile,
  output: new Blob(['']),
  format: 'png',
  size: 1024
};
```

## Best Practices

1. **Test Organization**
   - Group tests by feature
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)
   - Keep tests independent

2. **Test Coverage**
   - Aim for high coverage of core functionality
   - Focus on critical paths
   - Test error cases
   - Include edge cases

3. **Performance**
   - Use appropriate test data sizes
   - Mock heavy operations
   - Clean up resources
   - Monitor test execution time

4. **Maintenance**
   - Keep tests up to date
   - Refactor tests with code changes
   - Document test requirements
   - Review test coverage regularly

## Running Tests

### Unit & Integration Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test tests/unit/converters/pdf.test.ts

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests
```bash
# Run web app tests
npm run test:e2e:web

# Run extension tests
npm run test:e2e:extension

# Run all e2e tests
npm run test:e2e
```

## CI/CD Integration

Tests are automatically run in the CI pipeline:
1. Unit tests on every push
2. Integration tests on pull requests
3. End-to-end tests before deployment
4. Coverage reports generated and tracked 