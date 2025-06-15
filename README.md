# NoServerConvert

A browser-based file converter that processes files locally without sending them to a server. Built with Vue 3, TypeScript, and Vite.

## Features

- **Local Processing**: All file conversions happen in your browser - your files never leave your device
- **Multiple Formats**: Convert between various file formats:
  - **PDF Converter**:
    - PDF to Image (PNG/JPG)
    - PDF to Text
    - PDF to HTML
    - Batch processing (up to 10 files)
  - **Image Converter**:
    - Convert between JPG, PNG, WebP
    - Image compression
    - Batch processing (up to 10 files)
  - **Audio Converter**:
    - Convert between MP3, WAV, OGG
    - Audio compression
    - Batch processing (up to 10 files)
  - **Video Converter**:
    - Convert to MP4, WebM
    - Extract audio from video
    - Video compression
    - Batch processing (up to 5 files)

## Technical Details

- **Frontend**: Vue 3 + TypeScript + Vite
- **State Management**: Pinia
- **File Processing**:
  - PDF.js for PDF operations
  - FFmpeg.wasm for audio/video processing
  - Canvas API for image processing
- **Browser Support**: Modern browsers with WebAssembly support

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
NoServerConvert/
├── src/
│   ├── components/      # Reusable components
│   │   └── common/      # Common components like FileUpload
│   │   └── converters/ # Converter components
│   ├── stores/         # Pinia stores
│   └── assets/         # Static assets
├── public/             # Public files
│   ├── ffmpeg-core.js  # FFmpeg core
│   └── pdf.worker.js   # PDF.js worker
└── doc/               # Documentation
    ├── user/          # User documentation
    └── development/   # Developer documentation
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Note: Some features require WebAssembly support and modern browser APIs.

## File Size Limits

- PDF: 100MB per file, max 10 files
- Image: 50MB per file, max 10 files
- Audio: 100MB per file, max 10 files
- Video: 500MB per file, max 5 files

## Security

- All processing happens locally in your browser
- No server-side processing
- No file uploads to external servers
- No tracking or analytics

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
