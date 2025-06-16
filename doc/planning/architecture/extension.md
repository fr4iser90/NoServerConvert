# Browser Extension Architecture

## Overview
Die Browser Extension ist eine Chrome/Firefox Extension, die die Shared Converter-Logik nutzt und eine native Browser-Integration bietet.

## Directory Structure
```
src/extension/
├── components/          # Extension-specific components
│   ├── common/         # Shared extension components
│   │   ├── FileUpload.vue    # [PLANNED] File upload
│   │   ├── ProgressBar.vue   # [PLANNED] Progress tracking
│   │   └── ErrorDisplay.vue  # [PLANNED] Error handling
│   └── converters/     # Converter-specific components
│       ├── document/   # Document converter components
│       │   └── pdf/    # [PLANNED] PDF components
│       │       └── ConversionOptions.vue
│       ├── image/      # [PLANNED] Image components
│       ├── audio/      # [PLANNED] Audio components
│       └── video/      # [PLANNED] Video components
│
├── stores/             # Extension-specific state management
│   ├── app.ts         # [PLANNED] App state
│   └── converters/    # Converter stores
│       ├── pdf.ts     # [PLANNED] PDF converter store
│       ├── image.ts   # [PLANNED] Image converter store
│       └── ...
│
├── background/         # Extension background scripts
│   ├── index.ts       # [PLANNED] Background script
│   └── handlers/      # [PLANNED] Event handlers
│
├── popup/             # Extension popup
│   ├── Popup.vue      # [PLANNED] Main popup
│   └── components/    # [PLANNED] Popup components
│
└── content/           # Content scripts
    └── index.ts       # [PLANNED] Content script
```

## Component Architecture

### 1. Common Components
- **FileUpload** [PLANNED]
  - Drag & Drop
  - Dateiauswahl
  - Größenvalidierung
  - Format-Validierung

- **ProgressBar** [PLANNED]
  - Fortschrittsanzeige
  - Status-Updates
  - Fehleranzeige
  - Abbrechen-Option

- **ErrorDisplay** [PLANNED]
  - Fehlermeldungen
  - Validierungsfehler
  - Formatfehler
  - Systemfehler

### 2. Converter Components
- **PDF Components** [PLANNED]
  - ConversionOptions
  - Format-spezifische Einstellungen
  - Qualitätsoptionen
  - ZIP-Optionen

- **Image Components** [PLANNED]
  - Format-Konvertierung
  - Kompressionsoptionen
  - Größenanpassung

- **Audio Components** [PLANNED]
  - Format-Konvertierung
  - Qualitätseinstellungen
  - Bitrate-Optionen

- **Video Components** [PLANNED]
  - Format-Konvertierung
  - Codec-Einstellungen
  - Qualitätsoptionen

## Extension Architecture

### 1. Background Script
- Event Handling
- State Management
- File Processing
- Browser API Integration

### 2. Popup Interface
- Converter Selection
- File Upload
- Progress Display
- Settings Management

### 3. Content Script
- Page Integration
- Context Menu
- File Detection
- Download Handling

## State Management (Pinia)

### 1. App Store [PLANNED]
```typescript
interface AppState {
  currentConverter: string;
  isProcessing: boolean;
  globalError: string | null;
  settings: UserSettings;
}
```

### 2. Converter Stores
- **PDF Store** [PLANNED]
  ```typescript
  interface PdfState {
    selectedFiles: File[];
    useZip: boolean;
    imageFormat: string;
    error: string | null;
  }
  ```
- **Image Store** [PLANNED]
- **Audio Store** [PLANNED]
- **Video Store** [PLANNED]

## Integration with Shared Code

### 1. Converter Usage
- Import der Shared Converter
- State Management
- Error Handling
- Progress Tracking

### 2. Component Structure
- Popup nutzt Stores
- Stores nutzen Shared Converter
- Components sind UI-only
- Keine Business-Logik in Components

## Browser Integration

### 1. Manifest
- Permissions
- Content Scripts
- Background Scripts
- Icons & Assets

### 2. APIs
- Storage API
- Download API
- Context Menu API
- File System API

### 3. Security
- CSP
- Permissions
- File Access
- Network Access

## UI/UX Design

### 1. Popup Design
- Compact Layout
- Quick Actions
- Status Display
- Settings Access

### 2. Styling
- TailwindCSS
- Custom Components
- Dark/Light Theme
- Consistent Design

### 3. User Experience
- Intuitive Navigation
- Klare Fehlermeldungen
  - Fortschrittsanzeige
  - Format-Validierung

## Development

### 1. Tools
- Vue 3
- TypeScript
- Vite
- Pinia
- Chrome Extension APIs
- Firefox Extension APIs

### 2. Testing
- Vitest
- Cypress
- Component Tests
- E2E Tests

### 3. Quality
- ESLint
- Prettier
- TypeScript
- Code Review
