import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AiConverter } from '@shared/converters/modules/image/vector/ai/AiConverter'

interface AiState {
  selectedFiles: File[]
  error: string | null
  isProcessing: boolean
  imageFormat: string
  imageQuality: number
  optimizeSvg: boolean
  compressPdf: boolean
}

export const useAiStore = defineStore('ai-converter', {
  state: (): AiState => ({
    selectedFiles: [],
    error: null,
    isProcessing: false,
    imageFormat: 'png',
    imageQuality: 0.9,
    optimizeSvg: true,
    compressPdf: true
  }),

  actions: {
    handleFilesSelected(files: File[]) {
      this.error = null
      const converter = new AiConverter()
      
      // Validiere, dass alle Dateien AI-Dateien sind
      const validFiles = files.filter(file => converter.validate(file))
      
      if (validFiles.length !== files.length) {
        this.error = 'Einige Dateien sind keine gültigen AI-Dateien'
        return
      }

      this.selectedFiles = [...this.selectedFiles, ...validFiles]
    },

    removeFile(fileToRemove: File) {
      this.selectedFiles = this.selectedFiles.filter(file => file !== fileToRemove)
    },

    async startConversion(format: 'image' | 'svg' | 'pdf') {
      if (!this.selectedFiles.length) return

      try {
        this.isProcessing = true
        this.error = null

        const converter = new AiConverter()
        const options = {
          format,
          imageFormat: this.imageFormat,
          imageQuality: this.imageQuality,
          optimizeSvg: this.optimizeSvg,
          compressPdf: this.compressPdf
        }

        for (const file of this.selectedFiles) {
          const result = await converter.convert(file, options)
          
          if (result.error) {
            throw new Error(result.error)
          }

          // Download the converted file
          const url = URL.createObjectURL(result.blob)
          const a = document.createElement('a')
          a.href = url
          a.download = result.fileName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }

        // Clear files after successful conversion
        this.selectedFiles = []
      } catch (err) {
        console.error('[AI Converter] Conversion failed:', err)
        this.error = err instanceof Error ? err.message : 'Conversion failed'
      } finally {
        this.isProcessing = false
      }
    }
  }
}) 