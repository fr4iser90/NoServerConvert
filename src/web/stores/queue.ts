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
    
    // Auto-start processing if not already running
    if (!isProcessing.value) {
      startProcessing()
    }
  }

  function removeFile(id: string) {
    const index = files.value.findIndex(f => f.id === id)
    if (index !== -1) {
      files.value.splice(index, 1)
    }
  }

  function updateFileStatus(id: string, status: QueuedFile['status'], progress = 0, error?: string) {
    const file = files.value.find(f => f.id === id)
    if (file) {
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
    }
  }

  async function startProcessing() {
    if (isProcessing.value) return
    
    isProcessing.value = true
    
    while (canProcessMore.value) {
      const nextFile = pendingFiles.value[0]
      if (!nextFile) break
      
      processFile(nextFile)
    }
    
    // Check if we're done
    if (processingFiles.value.length === 0) {
      isProcessing.value = false
    }
  }

  async function processFile(queuedFile: QueuedFile) {
    updateFileStatus(queuedFile.id, 'processing', 0)
    
    try {
      // Import the appropriate converter
      const { PdfConverter } = await import('@shared/converters/modules/document/pdf/PdfConverter')
      const { JpgConverter } = await import('@shared/converters/modules/image/basic/jpg/JpgConverter')
      // Add other converters as needed
      
      let converter
      switch (queuedFile.converter) {
        case 'pdf':
          converter = new PdfConverter()
          break
        case 'jpg':
          converter = new JpgConverter()
          break
        default:
          throw new Error(`Unknown converter: ${queuedFile.converter}`)
      }
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        const currentFile = files.value.find(f => f.id === queuedFile.id)
        if (currentFile && currentFile.status === 'processing') {
          currentFile.progress = Math.min(currentFile.progress + 10, 90)
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
      updateFileStatus(queuedFile.id, 'error', 0, error instanceof Error ? error.message : 'Unknown error')
    }
    
    // Continue processing if there are more files
    if (canProcessMore.value) {
      const nextFile = pendingFiles.value[0]
      if (nextFile) {
        processFile(nextFile)
      }
    } else if (processingFiles.value.length === 0) {
      isProcessing.value = false
    }
  }

  function pauseProcessing() {
    isProcessing.value = false
  }

  function clearCompleted() {
    files.value = files.value.filter(f => f.status !== 'completed')
  }

  function clearErrors() {
    files.value = files.value.filter(f => f.status !== 'error')
  }

  function clearAll() {
    files.value = []
    isProcessing.value = false
  }

  function retryFile(id: string) {
    const file = files.value.find(f => f.id === id)
    if (file && file.status === 'error') {
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
    }
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
    setPriority
  }
})