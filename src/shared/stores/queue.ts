import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface QueuedFile {
  id: string
  file: File
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  convertedBlob?: Blob
  convertedName?: string
  converter: string
  options?: Record<string, any>
}

export const useQueueStore = defineStore('queue', () => {
  const files = ref<QueuedFile[]>([])
  const isProcessing = ref(false)
  const currentBatchSize = ref(10)

  const pendingFiles = computed(() => 
    files.value.filter(f => f.status === 'pending')
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

  function addFiles(newFiles: File[], converter: string, options: Record<string, any> = {}) {
    const queuedFiles = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending' as const,
      progress: 0,
      converter,
      options
    }))
    
    files.value.push(...queuedFiles)
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
    }
  }

  function setConvertedFile(id: string, blob: Blob, name?: string) {
    const file = files.value.find(f => f.id === id)
    if (file) {
      file.convertedBlob = blob
      file.convertedName = name
      file.status = 'completed'
      file.progress = 100
    }
  }

  function clearQueue() {
    files.value = []
    isProcessing.value = false
  }

  function startProcessing() {
    isProcessing.value = true
  }

  function stopProcessing() {
    isProcessing.value = false
  }

  function setBatchSize(size: number) {
    currentBatchSize.value = size
  }

  return {
    files,
    isProcessing,
    currentBatchSize,
    pendingFiles,
    processingFiles,
    completedFiles,
    errorFiles,
    addFiles,
    removeFile,
    updateFileStatus,
    setConvertedFile,
    clearQueue,
    startProcessing,
    stopProcessing,
    setBatchSize
  }
}) 