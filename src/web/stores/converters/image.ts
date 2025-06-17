import { defineStore } from 'pinia'
import { JpgConverter } from '@shared/converters/modules/image/basic/jpg/JpgConverter'
import { PngConverter } from '@shared/converters/modules/image/basic/png/PngConverter'
import { WebpConverter } from '@shared/converters/modules/image/basic/webp/WebpConverter'

interface ImageState {
  selectedFiles: File[]
  error: string | null
  isProcessing: boolean
  imageFormat: string
  imageQuality: number
  loadingMessage: string
  loadingProgress: number
  currentFile: number
  totalFiles: number
}

export const useImageStore = defineStore('image-converter', {
  state: (): ImageState => ({
    selectedFiles: [],
    error: null,
    isProcessing: false,
    imageFormat: 'png',
    imageQuality: 1.0,
    loadingMessage: '',
    loadingProgress: 0,
    currentFile: 0,
    totalFiles: 0
  }),

  actions: {
    handleFilesSelected(files: File[]) {
      this.error = null
      const converters = [new JpgConverter(), new PngConverter(), new WebpConverter()]
      
      // Validiere, dass alle Dateien Bilder sind
      const validFiles = files.filter(file => 
        converters.some(converter => converter.validate(file))
      )
      
      if (validFiles.length !== files.length) {
        this.error = 'Some files are not valid images'
        return
      }

      this.selectedFiles = [...this.selectedFiles, ...validFiles]
    },

    removeFile(fileToRemove: File) {
      this.selectedFiles = this.selectedFiles.filter(file => file !== fileToRemove)
    },

    async startConversion(format: 'jpg' | 'png' | 'webp') {
      if (!this.selectedFiles.length) return

      try {
        this.isProcessing = true
        this.error = null
        this.totalFiles = this.selectedFiles.length
        this.loadingMessage = `Converting ${this.totalFiles} images to ${format.toUpperCase()}...`

        const converter = format === 'jpg' ? new JpgConverter() :
                        format === 'png' ? new PngConverter() :
                        new WebpConverter()

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i]
          this.currentFile = i + 1
          this.loadingProgress = Math.round(((i + 1) / this.selectedFiles.length) * 100)
          this.loadingMessage = `Converting ${file.name} to ${format.toUpperCase()}...`

          const result = await converter.convert(file, {
            format: `image/${format}`,
            quality: this.imageQuality
          })
          
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
        this.loadingMessage = 'Conversion completed!'
        
        setTimeout(() => {
          this.isProcessing = false
          this.loadingMessage = ''
          this.loadingProgress = 0
        }, 1000)
      } catch (err) {
        console.error('[Image Converter] Conversion failed:', err)
        this.error = err instanceof Error ? err.message : 'Conversion failed'
        this.isProcessing = false
      }
    }
  }
})