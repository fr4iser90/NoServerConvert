import { defineStore } from 'pinia'

export interface QueuedFile {
  id: string
  file: File
  type: 'image' | 'video' | 'audio' | 'pdf'
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  convertedFile?: Blob
  convertedName?: string
  options?: Record<string, any>
}

interface QueueState {
  queue: QueuedFile[]
  isProcessing: boolean
  batchSize: number
}

export const useQueueStore = defineStore('queue', {
  state: (): QueueState => ({
    queue: [],
    isProcessing: false,
    batchSize: 10 // Maximale Anzahl gleichzeitiger Verarbeitungen
  }),

  getters: {
    pendingFiles: (state) => state.queue.filter(f => f.status === 'pending'),
    processingFiles: (state) => state.queue.filter(f => f.status === 'processing'),
    completedFiles: (state) => state.queue.filter(f => f.status === 'completed'),
    errorFiles: (state) => state.queue.filter(f => f.status === 'error'),
    hasPendingFiles: (state) => state.queue.some(f => f.status === 'pending'),
    currentBatch: (state) => state.queue.filter(f => f.status === 'processing').slice(0, state.batchSize)
  },

  actions: {
    addFiles(files: File[], type: QueuedFile['type'], options?: Record<string, any>) {
      const newFiles: QueuedFile[] = files.map(file => ({
        id: crypto.randomUUID(),
        file,
        type,
        status: 'pending',
        progress: 0,
        options
      }))

      // Wenn wir bereits Dateien verarbeiten, füge neue zur Queue hinzu
      if (this.isProcessing) {
        this.queue.push(...newFiles)
        return
      }

      // Wenn wir keine Dateien verarbeiten, starte die Verarbeitung
      this.queue.push(...newFiles)
      this.processNextBatch()
    },

    async processNextBatch() {
      if (this.isProcessing || !this.hasPendingFiles) return

      this.isProcessing = true
      const batch = this.pendingFiles.slice(0, this.batchSize)

      // Markiere Batch als "processing"
      batch.forEach(file => {
        this.updateFileStatus(file.id, 'processing', 0)
      })

      // Hier würde die eigentliche Verarbeitung stattfinden
      // Die Converter-Stores würden diese Methode aufrufen
    },

    updateFileStatus(id: string, status: QueuedFile['status'], progress: number, error?: string) {
      const file = this.queue.find(f => f.id === id)
      if (file) {
        file.status = status
        file.progress = progress
        if (error) file.error = error
      }
    },

    setConvertedFile(id: string, blob: Blob, name: string) {
      const file = this.queue.find(f => f.id === id)
      if (file) {
        file.convertedFile = blob
        file.convertedName = name
        file.status = 'completed'
        file.progress = 100
      }
    },

    removeFile(id: string) {
      this.queue = this.queue.filter(f => f.id !== id)
    },

    clearQueue() {
      this.queue = []
      this.isProcessing = false
    },

    clearCompleted() {
      this.queue = this.queue.filter(f => f.status !== 'completed')
    },

    clearErrors() {
      this.queue = this.queue.filter(f => f.status !== 'error')
    }
  }
}) 