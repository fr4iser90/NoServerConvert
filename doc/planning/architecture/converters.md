# Converter Architecture

## Core Principles
- Framework-unabhängige Konvertierungslogik
- Klare Trennung zwischen Core-Logik und UI
- Wiederverwendbar für Web und Extension
- Fokus auf Performance und Speichereffizienz

## Directory Structure
```
src/shared/converters/          # Core converter logic
├── core/                       # Core converter framework
│   ├── base/                  # Base converter classes
│   │   ├── BaseConverter.ts   # [IMPLEMENTED] Base converter
│   │   ├── FileProcessor.ts   # [PLANNED] File processing
│   │   └── WorkerManager.ts   # [PLANNED] Worker management
│   ├── types/                 # Type definitions
│   │   ├── converter.ts       # [IMPLEMENTED] Core types
│   │   ├── formats.ts         # [PLANNED] Format types
│   │   └── worker.ts          # [PLANNED] Worker types
│   └── utils/                 # Shared utilities
│       ├── validation.ts      # [PLANNED] File validation
│       ├── memory.ts          # [PLANNED] Memory management
│       └── progress.ts        # [PLANNED] Progress tracking
│
├── modules/                    # Converter modules
│   ├── document/              # Document converters
│   │   ├── pdf/              # [IMPLEMENTED] PDF converter
│   │   │   ├── PdfConverter.ts    # Core PDF logic
│   │   │   └── types.ts           # PDF-specific types
│   │   ├── office/           # [PLANNED] Office formats
│   │   │   ├── docx/        # DOCX converter
│   │   │   ├── xlsx/        # XLSX converter
│   │   │   └── pptx/        # PPTX converter
│   │   └── ebook/           # [PLANNED] E-book formats
│   │       ├── epub/        # EPUB converter
│   │       └── mobi/        # MOBI converter
│   │
│   ├── image/                # [PLANNED] Image converters
│   │   ├── basic/           # Basic formats
│   │   │   ├── jpg/        # JPG converter
│   │   │   ├── png/        # PNG converter
│   │   │   └── webp/       # WebP converter
│   │   ├── raw/            # RAW formats
│   │   │   ├── cr2/        # CR2 converter
│   │   │   └── nef/        # NEF converter
│   │   └── vector/         # Vector formats
│   │       ├── svg/        # SVG converter
│   │       └── ai/         # AI converter
│   │
│   ├── audio/               # [PLANNED] Audio converters
│   │   ├── basic/          # Basic formats
│   │   │   ├── mp3/       # MP3 converter
│   │   │   ├── wav/       # WAV converter
│   │   │   └── ogg/       # OGG converter
│   │   ├── lossless/      # Lossless formats
│   │   │   ├── flac/      # FLAC converter
│   │   │   └── alac/      # ALAC converter
│   │   └── advanced/      # Advanced formats
│   │       ├── aac/       # AAC converter
│   │       └── m4a/       # M4A converter
│   │
│   └── video/              # [PLANNED] Video converters
│       ├── basic/          # Basic formats
│       │   ├── mp4/       # MP4 converter
│       │   └── webm/      # WebM converter
│       ├── advanced/      # Advanced formats
│       │   ├── mkv/       # MKV converter
│       │   └── avi/       # AVI converter
│       └── streaming/     # Streaming formats
│           ├── hls/       # HLS converter
│           └── dash/      # DASH converter
│
├── plugins/                 # [PLANNED] Optional converter plugins
│   ├── archive/            # Archive formats
│   │   ├── zip/           # ZIP converter
│   │   ├── rar/           # RAR converter
│   │   └── 7z/            # 7Z converter
│   ├── code/              # Code formats
│   │   ├── minify/        # Code minification
│   │   └── format/        # Code formatting
│   └── specialized/       # Specialized formats
│       ├── cad/           # CAD formats
│       └── 3d/            # 3D formats
│
└── registry/              # [PLANNED] Converter registry
    ├── index.ts           # Main registry
    ├── loader.ts          # Dynamic loading
    └── metadata.ts        # Format metadata
```

## Module System

### 1. Base Converter [IMPLEMENTED]
```typescript
interface IConverter {
  id: string;                 // Unique converter ID
  name: string;               // Display name
  formats: Format[];          // Supported formats
  validate(file: File): boolean;  // File validation
  convert(file: File, options: ConverterOptions): Promise<ConvertResult>;  // Core conversion
}

interface Format {
  id: string;                 // Format ID (e.g., 'pdf-to-image')
  name: string;               // Display name
  inputTypes: string[];       // Supported input MIME types
  outputTypes: string[];      // Supported output MIME types
}

interface ConverterOptions {
  format: string;             // Target format
  quality?: number;           // Optional quality setting
  useZip?: boolean;          // Optional ZIP packaging
}

interface ConvertResult {
  blob: Blob;                 // Converted file
  fileName: string;           // Output filename
  error?: string;            // Error message if failed
}
```

### 2. Format Registry [PLANNED]
```typescript
interface FormatRegistry {
  register(format: Format): void;
  getFormat(id: string): Format | undefined;
  getFormatsByCategory(category: string): Format[];
  validateFormat(format: Format): boolean;
}
```

### 3. Plugin System [PLANNED]
```typescript
interface ConverterPlugin {
  id: string;
  name: string;
  formats: Format[];
  dependencies: string[];
  initialize(): Promise<void>;
  getConverter(format: string): IConverter;
}
```

## Module Implementation

### 1. PDF Converter [IMPLEMENTED]
- Core PDF processing logic
- Framework-unabhängig
- Nutzt PDF.js für Verarbeitung
- Unterstützt:
  - PDF zu Bild
  - PDF zu Text
  - PDF zu HTML

### 2. Image Converter [PLANNED]
- Basis Bildkonvertierung
- Format-Validierung
- Qualitätseinstellungen
- Unterstützt:
  - PNG, JPG, WebP
  - Kompression
  - Größenanpassung

### 3. Audio Converter [PLANNED]
- Basis Audiokonvertierung
- Format-Validierung
- Qualitätseinstellungen
- Unterstützt:
  - MP3, WAV, OGG
  - Bitrate-Einstellungen

### 4. Video Converter [PLANNED]
- Basis Videokonvertierung
- Format-Validierung
- Qualitätseinstellungen
- Unterstützt:
  - MP4, WebM
  - Codec-Einstellungen

## Processing Pipeline

### 1. File Input [IMPLEMENTED]
- Format-Validierung
- Größenprüfung
- Typ-Überprüfung

### 2. Processing [PARTIALLY IMPLEMENTED]
- Web Worker für Verarbeitung [IMPLEMENTED]
- Speichermanagement [PLANNED]
- Fortschrittsverfolgung [PLANNED]
- Fehlerbehandlung [IMPLEMENTED]

### 3. Output [IMPLEMENTED]
- Format-Konvertierung
- Qualitätskontrolle
- Validierung
- Download-Handling

## Dependencies

### Core Dependencies [IMPLEMENTED]
- PDF.js (PDF)
- Web Workers
- WebAssembly

### Format-Specific [PLANNED]
- FFmpeg.wasm (Media)
- ImageMagick (Images)
- Office.js (Documents)

### Optional Dependencies [PLANNED]
- Loaded dynamically
- Plugin-specific
- Format-specific

## Performance

### 1. Resource Management [PARTIALLY IMPLEMENTED]
- Web Worker für Verarbeitung [IMPLEMENTED]
- Speicherüberwachung [PLANNED]
- Ressourcen-Cleanup [PLANNED]
- Format-Erkennung [IMPLEMENTED]

### 2. Optimization [PARTIALLY IMPLEMENTED]
- Lazy Loading [IMPLEMENTED]
- Code Splitting [IMPLEMENTED]
- Worker Wiederverwendung [PLANNED]
- Speicherlimits [PLANNED]

## Security

### 1. File Handling [IMPLEMENTED]
- Format-Validierung
- Größenlimits
- Typ-Überprüfung
- Sandboxing

### 2. Processing [PARTIALLY IMPLEMENTED]
- Worker Isolation [IMPLEMENTED]
- Speicherlimits [PLANNED]
- Ressourcenkontrolle [PLANNED]
- Fehlerbehandlung [IMPLEMENTED]

## Integration

### Web Application [IMPLEMENTED]
- Store nutzt Converter
- UI-Komponenten für Interaktion
- Fortschrittsanzeige
- Fehlerbehandlung

### Browser Extension [PLANNED]
- Gleiche Core-Logik
- Extension-spezifische UI
- Kontextmenü-Integration
- Download-Handling

## Future Development

### 1. Extensibility
- Plugin system
- Format registry
- Dynamic loading
- Custom converters
- External tools

### 2. Integration
- Cloud storage
- External APIs
- Browser extensions
- Desktop apps
- Mobile apps

### 3. Optimization
- Performance
- Memory usage
- Format support
- Worker management
- Plugin system 