# Queue System Architecture

## Overview
The queue system manages file processing in batches, handles memory efficiently, and provides a robust user interface for monitoring and control.

## Core Components

### 1. Queue Store (Pinia)
```typescript
interface QueueState {
  // Queue Management
  files: QueuedFile[]          // All files in queue
  currentBatch: QueuedFile[]   // Currently processing batch
  processedFiles: QueuedFile[] // Completed files
  
  // Status
  isProcessing: boolean        // Queue processing status
  currentFileIndex: number     // Current file in batch
  batchSize: number           // Current batch size (dynamic)
  
  // Memory Management
  memoryUsage: number         // Current memory usage
  maxMemoryUsage: number      // Maximum allowed memory
  lowMemoryThreshold: number  // When to reduce batch size

  // Advanced Controls
  schedule: QueueSchedule     // Processing schedule
  autoStart: boolean         // Auto-start new files
  pauseOnError: boolean      // Pause on first error
  retryCount: number         // Max retry attempts
}

interface QueuedFile {
  id: string
  file: File
  status: 'pending' | 'processing' | 'completed' | 'error' | 'scheduled' | 'paused'
  progress: number
  error?: string
  converter: string          // Which converter to use
  options: ConverterOptions  // Converter-specific options
  
  // Advanced File Controls
  priority: number          // Processing priority (1-10)
  scheduledTime?: Date      // When to start processing
  position: number          // Position in queue
  retries: number           // Current retry count
  dependencies?: string[]   // Files that must complete first
}

interface QueueSchedule {
  isEnabled: boolean
  activeHours: {
    start: string    // "HH:mm" format
    end: string      // "HH:mm" format
  }
  daysOfWeek: number[]  // 0-6 (Sunday-Saturday)
  timezone: string
}
```

### 2. Queue Manager
- **Batch Processing**
  - Dynamic batch sizing based on memory
  - Auto-resume on memory errors
  - Priority handling
  
- **Memory Management**
  - Memory usage monitoring
  - Automatic batch size adjustment
  - Garbage collection triggers
  
- **Error Handling**
  - Error recovery
  - Auto-retry logic
  - User notifications

- **Advanced Controls**
  - Schedule management
  - Position switching
  - Priority processing
  - Dependency resolution
  - Auto-retry with backoff

### 3. Queue UI Components
- **QueueList**
  - Shows all queued files
  - File status and progress
  - Batch information
  - Drag-and-drop reordering
  - Priority indicators
  
- **QueueControls**
  - Start/Stop processing
  - Clear queue
  - Batch size adjustment
  - Schedule editor
  - Priority editor
  
- **MemoryMonitor**
  - Current memory usage
  - Memory warnings
  - Batch size suggestions

- **SchedulePanel**
  - Time window settings
  - Day selection
  - Timezone handling
  - Schedule preview

## Processing Flow
1. **File Addition**
   - File added to queue
   - Initial status: pending/scheduled
   - Memory check before processing
   - Priority assignment
   - Schedule check

2. **Batch Processing**
   - Files grouped into batches
   - Batch size based on memory
   - One batch at a time
   - Priority-based ordering
   - Schedule-aware processing

3. **Memory Management**
   - Monitor memory during processing
   - Reduce batch size if needed
   - Trigger cleanup if critical

4. **Error Recovery**
   - Auto-pause on memory error
   - Reduce batch size
   - Resume processing
   - Retry with backoff

5. **Schedule Management**
   - Check schedule before processing
   - Pause/resume based on schedule
   - Handle timezone changes

## Implementation Phases

### Phase 1: Core Queue
- Basic queue store
- Simple batch processing
- Basic UI components
- Start/Stop controls

### Phase 2: Memory & Schedule
- Memory monitoring
- Dynamic batch sizing
- Auto-resume
- Basic scheduling
- Position switching

### Phase 3: Advanced Features
- Priority system
- Advanced error recovery
- Performance optimization
- Full schedule management
- Dependency handling

## Technical Considerations

### Memory Management
- Use `performance.memory` API
- Implement cleanup triggers
- Monitor heap usage

### Performance
- Web Workers for processing
- Chunked file handling
- Efficient batch processing

### Error Handling
- Graceful degradation
- User feedback
- Recovery mechanisms

### Scheduling
- Timezone handling
- Schedule persistence
- Conflict resolution

## Integration Points

### Converters
- Each converter implements queue interface
- Reports progress and status
- Handles memory efficiently
- Respects scheduling

### UI
- Real-time updates
- Progress indicators
- Error notifications
- Schedule visualization

### Storage
- Queue persistence
- Progress saving
- State recovery
- Schedule storage 