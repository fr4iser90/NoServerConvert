# Technical Architecture

## Project Status

### Current Stage
- Early development 
- Basic converter functionality implemented
- Core features in development
- Documentation in progress

### Git Repository
- Repository: [NoServerConvert](https://github.com/fr4iser/NoServerConvert)
- Branch Strategy:
  - `main` - Production-ready code
  - `develop` - Development branch
  - Feature branches: `feature/*`
  - Bug fixes: `fix/*`

### Contributors
- Initial setup and core development: [fr4iser](https://github.com/fr4iser)
- Looking for contributors for:
  - Frontend development
  - File processing optimization
  - Testing
  - Documentation
  - UI/UX design

## Overview

NoServerConvert is built as a single-page application (SPA) using Vue 3 and TypeScript. The application processes files entirely in the browser using WebAssembly and modern browser APIs.

## Core Technologies

### Frontend Framework
- **Vue 3**: Core framework with Composition API
- **TypeScript**: Type safety and better developer experience
- **Vite**: Build tool and development server
- **Pinia**: State management
- **Vue Router**: Client-side routing

### File Processing
- **PDF.js**: PDF parsing and rendering
- **FFmpeg.wasm**: Audio/video processing
- **Canvas API**: Image processing
- **Web Workers**: Background processing

## Architecture Components

### 1. Components Structure
```
src/
├── components/
│   ├── common/
│   │   └── FileUpload.vue    # Reusable file upload component
│   └── converters/           # Converter-specific components
├── views/
│   └── converters/           # Converter pages
├── stores/
│   └── app.ts               # Global state management
└── assets/                  # Static assets
```

### 2. State Management
- **Pinia Store**: Manages global application state
  - Current files
  - Processing status
  - Error handling
  - Dark mode

### 3. File Processing Pipeline
1. **File Selection**
   - Drag & drop or file picker
   - Format validation
   - Size validation

2. **Processing**
   - Web Worker initialization
   - Format-specific processing
   - Progress tracking

3. **Output**
   - Blob creation
   - Download handling
   - Memory cleanup

## Technical Considerations

### Performance
- Web Workers for heavy processing
- Chunked file processing
- Memory management
- Browser compatibility

### Security
- Local processing only
- No server communication
- Input validation
- Memory limits

### Browser Support
- WebAssembly support required
- Modern browser APIs
- Fallback handling

## Development Guidelines

### Git Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Write/update tests
5. Submit pull request
6. Code review
7. Merge to develop

### Code Style
- TypeScript strict mode
- Vue 3 Composition API
- Component-based architecture
- Proper error handling
- ESLint + Prettier configuration
- Conventional Commits

### Testing
- Unit tests with Vitest (TODO)
- Component testing (TODO)
- E2E testing with Playwright (TODO)
- Test coverage requirements (TODO)

### Build Process
- Vite for development
- Production optimization
- Asset handling
- Worker bundling

## Dependencies

### Core
- vue: ^3.5.13
- typescript: ~5.8.3
- vite: ^6.3.5
- pinia: ^3.0.3

### File Processing
- pdfjs-dist: ^5.3.31
- @ffmpeg/ffmpeg: ^0.12.15
- jszip: ^3.10.1

### Development
- @vitejs/plugin-vue: ^5.2.3
- sass: ^1.89.2
- vitest: ^3.2.3

## Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
- Nginx for static file serving
- Docker for containerization
- Traefik for reverse proxy (optional)

## Future Considerations

### Planned Features
- More format support
- Batch processing improvements
- Performance optimizations
- Additional conversion options

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### License Requirements
- Include copyright notice
- Include license text
- State significant changes
- No liability
- No warranty

## Contributing

### How to Contribute
1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Submit a pull request

### Development Setup
```bash
# Clone repository
git clone https://github.com/fr4iser/NoServerConvert.git
cd NoServerConvert

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests (TODO)
npm run test
```

### Required Skills
- Vue 3
- TypeScript
- WebAssembly
- File processing
- Browser APIs

## Roadmap

### Phase 1 (Current)
- [x] Project setup
- [x] Basic converter structure
- [ ] Core converter functionality
- [ ] Basic UI implementation
- [ ] Initial documentation

### Phase 2 (Next)
- [ ] Complete converter implementations
- [ ] Batch processing
- [ ] Progress tracking
- [ ] Error handling
- [ ] Basic testing

### Phase 3 (Future)
- [ ] Performance optimization
- [ ] Advanced features
- [ ] Comprehensive testing
- [ ] UI/UX improvements
- [ ] Documentation completion

## Technical Debt

### Current Issues
- Worker initialization needs optimization
- Memory management improvements needed
- Error handling to be enhanced
- Testing coverage to be implemented
- Documentation needs expansion

### Known Limitations
- Large file processing
- Browser memory constraints
- WebAssembly loading time
- Format support limitations

### State Management
- **Pinia Store**: Manages global application state
  - Current files
  - Processing status
  - Error handling
  - Dark mode 