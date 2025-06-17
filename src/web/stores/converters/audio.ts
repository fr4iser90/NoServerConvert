import { defineStore } from 'pinia'
import { useQueueStore } from '@web/stores/queue'

interface AudioState {
  selectedFiles: File[]
  error: string | null
  isProcessing: boolean
  audioFormat: string
  audioQuality: number
  ffmpeg: any | null
  loadingMessage: string
  loadingProgress: number
  currentFile: number
  totalFiles: number
}

export const useAudioStore = defineStore('audio-converter', {
  state: (): AudioState => ({
    selectedFiles: [],
    error: null,
    isProcessing: false,
    audioFormat: 'mp3',
    audioQuality: 2, // FFmpeg quality setting (0-9, lower is better)
    ffmpeg: null,
    loadingMessage: '',
    loadingProgress: 0,
    currentFile: 0,
    totalFiles: 0
  }),

  actions: {
    async initFFmpeg() {
      if (this.ffmpeg?.loaded) {
        console.log('[Audio Store] FFmpeg already loaded')
        return
      }

      try {
        // 🎯 WICHTIG: KEIN isProcessing = true beim Initialisieren!
        console.log('[Audio Store] Getting FFmpeg instance from queue store...')
        const queueStore = useQueueStore()
        this.ffmpeg = await queueStore.getFFmpegInstance('audio')
        console.log('[Audio Store] FFmpeg instance obtained successfully')
        
        // 🎯 KEIN Loading Spinner beim Initialisieren!
      } catch (error) {
        console.error('[Audio Store] Failed to get FFmpeg instance:', error)
        this.error = `Failed to initialize audio converter: ${error instanceof Error ? error.message : String(error)}`
        throw new Error(`Failed to initialize audio converter: ${error instanceof Error ? error.message : String(error)}`)
      }
    },

    handleFilesSelected(files: File[]) {
      this.error = null
      
      // Validiere, dass alle Dateien Audio sind
      const validFiles = files.filter(file => 
        file.type.startsWith('audio/') || 
        ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'].some(ext => 
          file.name.toLowerCase().endsWith(ext)
        )
      )
      
      if (validFiles.length !== files.length) {
        this.error = 'Some files are not valid audio files'
        return
      }

      this.selectedFiles = [...this.selectedFiles, ...validFiles]
    },

    removeFile(fileToRemove: File) {
      this.selectedFiles = this.selectedFiles.filter(file => file !== fileToRemove)
    },

    async startConversion(format: 'mp3' | 'wav' | 'ogg') {
      if (!this.selectedFiles.length || !this.ffmpeg) return

      try {
        // 🎯 NUR HIER isProcessing = true für Conversion!
        this.isProcessing = true
        this.error = null
        this.totalFiles = this.selectedFiles.length
        this.loadingMessage = `Converting ${this.totalFiles} audio files to ${format.toUpperCase()}...`

        const { fetchFile } = await import('@ffmpeg/util')

        // FFmpeg Optionen basierend auf Format
        const options = format === 'mp3' ? ['-c:a', 'libmp3lame', '-q:a', this.audioQuality.toString()] :
                       format === 'wav' ? ['-c:a', 'pcm_s16le'] :
                       ['-c:a', 'libvorbis', '-q:a', this.audioQuality.toString()]

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i]
          this.currentFile = i + 1
          this.loadingProgress = Math.round(((i + 1) / this.selectedFiles.length) * 100)
          this.loadingMessage = `Converting ${file.name} to ${format.toUpperCase()}...`

          // Write input file to FFmpeg's virtual filesystem
          const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
          const outputFileName = 'output.' + format
          console.log('[Audio Store] Writing input file:', inputFileName)
          await this.ffmpeg.writeFile(inputFileName, await fetchFile(file))

          // Run FFmpeg command
          console.log('[Audio Store] Converting to', format)
          await this.ffmpeg.exec([
            '-i', inputFileName,
            ...options,
            outputFileName
          ])

          // Read the output file
          const data = await this.ffmpeg.readFile(outputFileName)
          const blob = new Blob([data], { type: `audio/${format}` })
          
          // Download the converted file
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${file.name.split('.')[0]}.${format}`
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
        console.error('[Audio Store] Conversion failed:', err)
        this.error = err instanceof Error ? err.message : 'Conversion failed'
        this.isProcessing = false
      }
    },

    async compressAudio() {
      if (!this.selectedFiles.length || !this.ffmpeg) return

      try {
        // 🎯 NUR HIER isProcessing = true für Compression!
        this.isProcessing = true
        this.error = null
        this.totalFiles = this.selectedFiles.length
        this.loadingMessage = `Compressing ${this.totalFiles} audio files...`

        const { fetchFile } = await import('@ffmpeg/util')

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i]
          this.currentFile = i + 1
          this.loadingProgress = Math.round(((i + 1) / this.selectedFiles.length) * 100)
          this.loadingMessage = `Compressing ${file.name}...`

          const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
          const outputFileName = 'output' + file.name.substring(file.name.lastIndexOf('.'))
          
          await this.ffmpeg.writeFile(inputFileName, await fetchFile(file))

          // Compress audio with lower quality
          await this.ffmpeg.exec([
            '-i', inputFileName,
            '-c:a', 'libmp3lame',
            '-q:a', '4', // Lower quality for smaller file size
            '-ar', '44100', // Standard sample rate
            '-ac', '2', // Stereo
            outputFileName
          ])

          const data = await this.ffmpeg.readFile(outputFileName)
          const blob = new Blob([data], { type: file.type })
          
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `compressed_${file.name}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }

        this.selectedFiles = []
        this.loadingMessage = 'Compression completed!'
        
        setTimeout(() => {
          this.isProcessing = false
          this.loadingMessage = ''
          this.loadingProgress = 0
        }, 1000)
      } catch (err) {
        console.error('[Audio Store] Compression failed:', err)
        this.error = err instanceof Error ? err.message : 'Compression failed'
        this.isProcessing = false
      }
    }
  }
})