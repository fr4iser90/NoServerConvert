import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface QueuedFile {
  id: string
  file: File
  status: 'pending' | 'processing' | 'completed' | 'error' | 'paused'
  progress: number
  error?: string
  convertedBlob?: Blob
  convertedName?: string
  converter: string
  options?: Record<string, any>
  priority: number
  addedAt: Date
  startedAt?: Date
  completedAt?: Date
}

export const useQueueStore = defineStore('queue', () => {
  const files = ref<QueuedFile[]>([])
  const isProcessing = ref(false)
  const maxConcurrent = ref(3) // Process 3 files simultaneously
  const maxMemoryUsage = ref(1024 * 1024 * 1024) // 1GB limit

  // Computed properties
  const pendingFiles = computed(() => 
    files.value.filter(f => f.status === 'pending').sort((a, b) => b.priority - a.priority)
  )
  
  const processingFiles = computed(() => 
    files.value.filter(f => f.status === 'processing')
  )
  
  const completedFiles = computed(() => 
    files.value.filter(f => f.status === 'completed')
  )
  
  const errorFiles = computed(() => 
    files.value.filter(f => f.status === 'error')
  )

  const canProcessMore = computed(() => 
    processingFiles.value.length < maxConcurrent.value && pendingFiles.value.length > 0
  )

  const totalProgress = computed(() => {
    if (files.value.length === 0) return 0
    const total = files.value.reduce((sum, file) => sum + file.progress, 0)
    return Math.round(total / files.value.length)
  })

  // Actions
  function addFiles(newFiles: File[], converter: string, options: Record<string, any> = {}) {
    console.log(`[Queue] Adding ${newFiles.length} files to queue for ${converter} converter`)
    
    const queuedFiles = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending' as const,
      progress: 0,
      converter,
      options,
      priority: 5, // Default priority
      addedAt: new Date()
    }))
    
    files.value.push(...queuedFiles)
    console.log(`[Queue] Total files in queue: ${files.value.length}`)
    
    // Auto-start processing if not already running
    if (!isProcessing.value) {
      console.log('[Queue] Auto-starting queue processing')
      startProcessing()
    }
  }

  function removeFile(id: string) {
    const index = files.value.findIndex(f => f.id === id)
    if (index !== -1) {
      console.log(`[Queue] Removing file: ${files.value[index].file.name}`)
      files.value.splice(index, 1)
    }
  }

  function updateFileStatus(id: string, status: QueuedFile['status'], progress = 0, error?: string) {
    const file = files.value.find(f => f.id === id)
    if (file) {
      console.log(`[Queue] Updating ${file.file.name}: ${file.status} -> ${status} (${progress}%)`)
      file.status = status
      file.progress = progress
      if (error) file.error = error
      if (status === 'processing' && !file.startedAt) file.startedAt = new Date()
      if (status === 'completed' || status === 'error') file.completedAt = new Date()
    }
  }

  function setConvertedFile(id: string, blob: Blob, name?: string) {
    const file = files.value.find(f => f.id === id)
    if (file) {
      file.convertedBlob = blob
      file.convertedName = name
      file.status = 'completed'
      file.progress = 100
      file.completedAt = new Date()
      console.log(`[Queue] Conversion completed: ${file.file.name} -> ${name}`)
    }
  }

  async function startProcessing() {
    if (isProcessing.value) {
      console.log('[Queue] Already processing, skipping start')
      return
    }
    
    console.log('[Queue] Starting queue processing...')
    isProcessing.value = true
    
    // Process files concurrently up to maxConcurrent
    const processingPromises: Promise<void>[] = []
    
    while (canProcessMore.value && processingPromises.length < maxConcurrent.value) {
      const nextFile = pendingFiles.value[0]
      if (!nextFile) break
      
      console.log(`[Queue] Starting processing of: ${nextFile.file.name}`)
      processingPromises.push(processFile(nextFile))
    }
    
    // Wait for all current processing to complete
    if (processingPromises.length > 0) {
      await Promise.allSettled(processingPromises)
    }
    
    // Check if we can process more files
    if (canProcessMore.value) {
      // Recursively continue processing
      await startProcessing()
    } else {
      console.log('[Queue] Queue processing completed')
      isProcessing.value = false
    }
  }

  async function processFile(queuedFile: QueuedFile) {
    updateFileStatus(queuedFile.id, 'processing', 0)
    
    try {
      console.log(`[Queue] Processing ${queuedFile.file.name} with ${queuedFile.converter} converter`)
      
      // Import the appropriate converter dynamically
      let converter
      switch (queuedFile.converter) {
        case 'pdf': {
          const { PdfConverter } = await import('@shared/converters/modules/document/pdf/PdfConverter')
          converter = new PdfConverter()
          break
        }
        case 'image': {
          const format = queuedFile.options?.format || 'png'
          if (format === 'jpg' || format === 'jpeg') {
            const { JpgConverter } = await import('@shared/converters/modules/image/basic/jpg/JpgConverter')
            converter = new JpgConverter()
          } else if (format === 'webp') {
            const { WebpConverter } = await import('@shared/converters/modules/image/basic/webp/WebpConverter')
            converter = new WebpConverter()
          } else {
            const { PngConverter } = await import('@shared/converters/modules/image/basic/png/PngConverter')
            converter = new PngConverter()
          }
          break
        }
        case 'audio': {
          // For audio/video, we'll need to handle FFmpeg differently
          console.log('[Queue] Audio/Video processing not yet implemented in queue')
          throw new Error('Audio/Video queue processing not yet implemented')
        }
        case 'video': {
          console.log('[Queue] Video processing not yet implemented in queue')
          throw new Error('Video queue processing not yet implemented')
        }
        default:
          throw new Error(`Unknown converter: ${queuedFile.converter}`)
      }
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        const currentFile = files.value.find(f => f.id === queuedFile.id)
        if (currentFile && currentFile.status === 'processing') {
          currentFile.progress = Math.min(currentFile.progress + 15, 90)
        }
      }, 500)
      
      const result = await converter.convert(queuedFile.file, queuedFile.options)
      
      clearInterval(progressInterval)
      
      if (result.error) {
        updateFileStatus(queuedFile.id, 'error', 0, result.error)
      } else {
        setConvertedFile(queuedFile.id, result.blob, result.fileName)
      }
      
    } catch (error) {
      console.error(`[Queue] Error processing ${queuedFile.file.name}:`, error)
      updateFileStatus(queuedFile.id, 'error', 0, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  function pauseProcessing() {
    console.log('[Queue] Pausing processing')
    isProcessing.value = false
  }

  function clearCompleted() {
    const completedCount = completedFiles.value.length
    files.value = files.value.filter(f => f.status !== 'completed')
    console.log(`[Queue] Cleared ${completedCount} completed files`)
  }

  function clearErrors() {
    const errorCount = errorFiles.value.length
    files.value = files.value.filter(f => f.status !== 'error')
    console.log(`[Queue] Cleared ${errorCount} error files`)
  }

  function clearAll() {
    console.log('[Queue] Clearing all files')
    files.value = []
    isProcessing.value = false
  }

  function retryFile(id: string) {
    const file = files.value.find(f => f.id === id)
    if (file && file.status === 'error') {
      console.log(`[Queue] Retrying file: ${file.file.name}`)
      file.status = 'pending'
      file.progress = 0
      file.error = undefined
      
      if (!isProcessing.value) {
        startProcessing()
      }
    }
  }

  function setPriority(id: string, priority: number) {
    const file = files.value.find(f => f.id === id)
    if (file) {
      file.priority = Math.max(1, Math.min(10, priority))
      console.log(`[Queue] Set priority for ${file.file.name}: ${file.priority}`)
    }
  }

  function updateQueueOptions(converter: string, newOptions: Record<string, any>) {
    console.log(`[Queue] Updating options for ${converter} files:`, newOptions)
    files.value
      .filter(f => f.converter === converter && f.status === 'pending')
      .forEach(f => {
        f.options = { ...f.options, ...newOptions }
      })
  }

  return {
    // State
    files,
    isProcessing,
    maxConcurrent,
    maxMemoryUsage,
    
    // Computed
    pendingFiles,
    processingFiles,
    completedFiles,
    errorFiles,
    canProcessMore,
    totalProgress,
    
    // Actions
    addFiles,
    removeFile,
    updateFileStatus,
    setConvertedFile,
    startProcessing,
    pauseProcessing,
    clearCompleted,
    clearErrors,
    clearAll,
    retryFile,
    setPriority,
    updateQueueOptions
  }
})