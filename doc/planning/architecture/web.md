# Web Application Architecture

## Overview
Die Web-Anwendung ist eine Vue 3 Single Page Application, die die Shared Converter-Logik nutzt und eine benutzerfreundliche UI bereitstellt.

## Directory Structure
```
src/web/
├── components/          # Web-specific components
│   ├── common/         # Shared web components
│   │   ├── FileUpload.vue    # [IMPLEMENTED] File upload
│   │   ├── ProgressBar.vue   # [IMPLEMENTED] Progress tracking
│   │   └── ErrorDisplay.vue  # [IMPLEMENTED] Error handling
│   └── converters/     # Converter-specific components
│       ├── document/   # Document converter components
│       │   └── pdf/    # [IMPLEMENTED] PDF components
│       │       └── ConversionOptions.vue
│       ├── image/      # [PLANNED] Image components
│       ├── audio/      # [PLANNED] Audio components
│       └── video/      # [PLANNED] Video components
│
├── stores/             # Web-specific state management
│   ├── app.ts         # [IMPLEMENTED] App state
│   └── converters/    # Converter stores
│       ├── pdf.ts     # [IMPLEMENTED] PDF converter store
│       ├── image.ts   # [PLANNED] Image converter store
│       └── ...
│
└── views/              # Web pages
    ├── Home.vue       # [IMPLEMENTED] Landing page
    └── converters/    # Converter views
        ├── PdfConverter.vue  # [IMPLEMENTED] PDF converter
        ├── ImageConverter.vue # [PLANNED] Image converter
        └── ...
```

## Component Architecture

### 1. Common Components
- **FileUpload** [IMPLEMENTED]
  - Drag & Drop
  - Dateiauswahl
  - Größenvalidierung
  - Format-Validierung

- **ProgressBar** [IMPLEMENTED]
  - Fortschrittsanzeige
  - Status-Updates
  - Fehleranzeige
  - Abbrechen-Option

- **ErrorDisplay** [IMPLEMENTED]
  - Fehlermeldungen
  - Validierungsfehler
  - Formatfehler
  - Systemfehler

### 2. Converter Components
- **PDF Components** [IMPLEMENTED]
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

## State Management (Pinia)

### 1. App Store [IMPLEMENTED]
```typescript
interface AppState {
  currentConverter: string;
  isProcessing: boolean;
  globalError: string | null;
  settings: UserSettings;
}
```

### 2. Converter Stores
- **PDF Store** [IMPLEMENTED]
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
- Views nutzen Stores
- Stores nutzen Shared Converter
- Components sind UI-only
- Keine Business-Logik in Components

## UI/UX Design

### 1. Layout
- Responsive Design
- Mobile First
- Grid System
- Flexbox Layout

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

## Performance

### 1. Optimization
- Lazy Loading
- Code Splitting
- Asset Optimization
- Caching Strategy

### 2. Loading States
- Skeleton Screens
- Progress Indicators
- Error States
- Fallback Content

## Development

### 1. Tools
- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- TailwindCSS

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