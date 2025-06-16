# System Architecture Overview

## Project Structure
```
src/
├── shared/                    # Shared code between web and extensions
│   ├── converters/           # Core converter logic
│   │   ├── core/            # Base framework
│   │   │   ├── base/       # Base converter classes
│   │   │   ├── types/      # Common type definitions
│   │   │   └── utils/      # Shared utilities
│   │   └── modules/        # Format-specific converters
│   │       ├── document/   # Document converters
│   │       ├── image/      # Image converters
│   │       ├── audio/      # Audio converters
│   │       └── video/      # Video converters
│   ├── types/              # Common type definitions
│   └── utils/              # Shared utilities
│
├── web/                      # Web application
│   ├── components/          # Web-specific components
│   │   ├── common/         # Shared web components
│   │   │   ├── FileUpload.vue
│   │   │   ├── ProgressBar.vue
│   │   │   └── ErrorDisplay.vue
│   │   └── converters/     # Converter-specific components
│   │       ├── document/   # Document converter components
│   │       ├── image/      # Image converter components
│   │       ├── audio/      # Audio converter components
│   │       └── video/      # Video converter components
│   ├── stores/             # Web-specific state management
│   │   ├── app.ts         # App state
│   │   └── converters/    # Converter stores
│   │       ├── pdf.ts     # PDF converter store
│   │       ├── image.ts   # Image converter store
│   │       └── ...
│   ├── views/              # Web pages
│   │   ├── Home.vue
│   │   └── converters/    # Converter views
│   │       ├── PdfConverter.vue
│   │       ├── ImageConverter.vue
│   │       └── ...
│   └── main.ts             # Web entry point
│
└── extension/              # Browser extensions
    ├── popup/             # Extension popup UI
    │   ├── components/    # Popup components
    │   │   ├── common/   # Shared popup components
    │   │   └── converters/ # Converter popup components
    │   └── App.vue       # Popup root component
    ├── content/          # Content scripts
    │   └── handlers/     # Content script handlers
    │       ├── pdf.ts    # PDF content handler
    │       └── ...
    ├── background/       # Background scripts
    │   └── converters/   # Converter background handlers
    │       ├── pdf.ts    # PDF background handler
    │       └── ...
    └── manifest.json     # Extension manifest
```

## Core Principles

### 1. Code Separation
- **Shared Code**: Framework-unabhängige Core-Logik
  - Wird von Web UND Extension genutzt
  - Keine UI-Komponenten
  - Keine Framework-Abhängigkeiten
  - Fokus auf Wiederverwendbarkeit

- **Web Code**: Web-spezifische Implementierung
  - Nutzt Vue 3 + TypeScript
  - Enthält UI-Komponenten
  - State Management mit Pinia
  - Fokus auf Benutzerfreundlichkeit

- **Extension Code**: Extension-spezifische Implementierung
  - Nutzt gleiche Shared-Logik
  - Eigene UI für Popup/Content
  - Browser-spezifische APIs
  - Fokus auf Integration

### 2. Converter Architecture
- **Core Logic** (Shared):
  - Basis-Converter-Klassen
  - Format-spezifische Implementierungen
  - Gemeinsame Utilities
  - Typ-Definitionen

- **Web Integration** (Web):
  - Converter Stores
  - UI-Komponenten
  - View-Logik
  - State Management

- **Extension Integration** (Extension):
  - Popup UI
  - Content Scripts
  - Background Handler
  - Browser APIs

### 3. State Management
- **Shared State**:
  - Converter Status
  - Format Information
  - Common Types

- **Web State** (Pinia):
  - UI State
  - User Preferences
  - Converter Options
  - Progress Tracking

- **Extension State**:
  - Popup State
  - Background State
  - Browser Context

## Technical Stack

### Shared
- TypeScript
- Web Workers
- WebAssembly
- Core Libraries (PDF.js, etc.)

### Web
- Vue 3
- TypeScript
- Pinia
- Vue Router
- TailwindCSS

### Extension
- TypeScript
- Browser APIs
- Manifest V3
- Content Scripts

## Security Considerations

### 1. File Processing
- Lokale Verarbeitung
- Keine Server-Uploads
- Format-Validierung
- Größenlimits
- Speichermanagement

### 2. Browser Security
- Sandboxed Execution
- CORS Policies
- Content Security Policy
- Feature Detection

### 3. Data Privacy
- Keine Datensammlung
- Keine Analytics
- Kein Tracking
- Lokaler Storage

## Performance Strategy

### 1. Processing
- Web Workers
- Chunked Processing
- Speichermanagement
- Fortschrittsverfolgung

### 2. Web Application
- Lazy Loading
- Code Splitting
- Asset Optimization
- Caching

### 3. Extension
- Effiziente Popup UI
- Optimierte Content Scripts
- Background Processing
- Resource Management

## System Components

### 1. Frontend Application
- Vue 3 + TypeScript
- Vite build system
- Component-based architecture
- State management (Pinia)
- Progressive Web App

### 2. File Processing
- Web Workers for heavy tasks
- WebAssembly for performance
- Chunked processing
- Memory management
- Format validation

### 3. Converter System
- Modular converter architecture
- Format-specific processors
- Common processing pipeline
- Error handling
- Progress tracking

### 4. User Interface
- Responsive design
- Accessibility support
- Progressive enhancement
- Error feedback
- Progress indicators

## Architecture Decisions

### 1. Browser-Only Processing
- **Decision**: Process all files in browser
- **Rationale**: Privacy, no server costs
- **Trade-offs**: 
  - Limited by browser capabilities
  - Memory constraints
  - Processing speed

### 2. Web Workers
- **Decision**: Use Web Workers for processing
- **Rationale**: Non-blocking UI
- **Trade-offs**:
  - Communication overhead
  - Memory management
  - Browser support

### 3. WebAssembly
- **Decision**: Use WebAssembly for performance
- **Rationale**: Near-native speed
- **Trade-offs**:
  - Larger bundle size
  - Browser support
  - Development complexity

### 4. Progressive Web App
- **Decision**: Implement as PWA
- **Rationale**: Offline support
- **Trade-offs**:
  - Storage limits
  - Browser support
  - Update management

## Future Considerations

### 1. Scalability
- More format support
- Advanced processing
- Plugin system
- API development
- Ecosystem growth

### 2. Performance
- Better compression
- Faster processing
- Memory optimization
- Cache strategies
- Load balancing

### 3. Features
- Batch processing
- Format detection
- Preview system
- Custom workflows
- Advanced options

## Core Technologies

### Frontend Framework
- Vue 3 with TypeScript
- Vite as build tool
- Pinia for state management

### File Processing Libraries
- **PDF Processing**
  - PDF.js for PDF operations
  - Web Workers for background processing
  - Canvas API for PDF to image conversion

- **Media Processing**
  - FFmpeg.wasm for audio/video
  - Canvas API for images
  - Web Audio API for audio processing

### Browser Technologies
- WebAssembly for performance
- Web Workers for parallel processing
- File System Access API
- IndexedDB for temporary storage

## Development Setup

### Prerequisites
- Node.js (latest LTS)
- Modern browser with WebAssembly support
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/fr4iser/NoServerConvert.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Guidelines
- Follow TypeScript best practices
- Use Vue 3 Composition API
- Implement proper error handling
- Add tests for new features
- Document code changes 