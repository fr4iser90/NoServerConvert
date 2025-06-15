# Project Structure

## Directory Layout
```
src/
├── assets/              # Static assets (images, icons, etc.)
├── components/          # Reusable Vue components
│   ├── common/         # Shared components (buttons, inputs, etc.)
│   ├── converter/      # Converter-specific components
│   └── layout/         # Layout components (header, footer, etc.)
├── composables/        # Vue composables for shared logic
├── converters/         # Converter implementations
│   ├── pdf/           # PDF conversion logic
│   ├── image/         # Image conversion logic
│   ├── video/         # Video conversion logic
│   ├── audio/         # Audio conversion logic
│   └── document/      # Document conversion logic
├── pages/             # Main application pages
│   ├── Home.vue       # Landing page
│   ├── Converter.vue  # Main converter page
│   └── About.vue      # About/Help page
├── stores/            # Pinia stores for state management
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Key Decisions

### Single Page Application (SPA)
- Main converter interface in one page
- Tabs for different converter types
- Modal dialogs for settings and options
- No page reloads needed

### Component Organization
- Feature-based grouping
- Clear separation of concerns
- Reusable components in common/
- Converter-specific components in converter/

### State Management
- Pinia stores for:
  - Converter settings
  - File processing state
  - User preferences
  - Conversion history

### Code Splitting
- Lazy loading for converter modules
- Dynamic imports for heavy libraries
- Separate chunks for different converter types

## Module Loading Strategy
1. Core application loads first
2. Converter modules load on demand
3. Heavy libraries (FFmpeg, etc.) load when needed
4. Shared utilities always available
