import { defineStore } from 'pinia'
import { useQueueStore } from '@web/stores/queue'

interface VideoState {
  selectedFiles: File[]
  error: string | null
  isProcessing: boolean
  videoFormat: string
  videoQuality: number // CRF für MP4 (0-51, lower is better)
  ffmpeg: any | null
  loadingMessage: string
  loadingProgress: number
  currentFile: number
  totalFiles: number
}

export const useVideoStore = defineStore('video-converter', {
  state: (): VideoState => ({
    selectedFiles: [],
    error: null,
    isProcessing: false,
    videoFormat: 'mp4',
    videoQuality: 23, // Standard CRF Wert für gute Qualität
    ffmpeg: null,
    loadingMessage: '',
    loadingProgress: 0,
    currentFile: 0,
    totalFiles: 0
  }),

  actions: {
    async initFFmpeg() {
      if (this.ffmpeg?.loaded) {
        console.log('[Video Store] FFmpeg already loaded')
        return
      }

      try {
        console.log('[Video Store] Getting FFmpeg instance from queue store...')
        const queueStore = useQueueStore()
        this.ffmpeg = await queueStore.getFFmpegInstance('video')
        console.log('[Video Store] FFmpeg instance obtained successfully')
      } catch (error) {
        console.error('[Video Store] Failed to get FFmpeg instance:', error)
        this.error = `Failed to initialize video converter: ${error instanceof Error ? error.message : String(error)}`
        throw new Error(`Failed to initialize video converter: ${error instanceof Error ? error.message : String(error)}`)
      }
    },

    handleFilesSelected(files: File[]) {
      this.error = null
      const queueStore = useQueueStore()
      
      // Validiere, dass alle Dateien Video sind
      const validFiles = files.filter(file => 
        file.type.startsWith('video/') || 
        ['.mp4', '.webm', '.avi', '.mov', '.mkv'].some(ext => 
          file.name.toLowerCase().endsWith(ext)
        )
      )
      
      if (validFiles.length !== files.length) {
        this.error = 'Some files are not valid video files'
        return
      }

      // Wenn mehr als 10 Dateien, direkt in Queue
      if (validFiles.length > 10) {
        queueStore.addFiles(validFiles, 'video')
        return
      }

      // Sonst normal verarbeiten
      this.selectedFiles = [...this.selectedFiles, ...validFiles]
    },

    removeFile(fileToRemove: File) {
      const queueStore = useQueueStore()
      
      // Aus Store entfernen
      this.selectedFiles = this.selectedFiles.filter(file => file !== fileToRemove)
      
      // Auch aus Queue entfernen falls vorhanden
      const queuedFile = queueStore.files.find((f) => f.file === fileToRemove)
      if (queuedFile) {
        queueStore.removeFile(queuedFile.id)
      }
    },

    async startConversion(format: 'mp4' | 'webm') {
      const queueStore = useQueueStore()

      // Wenn Dateien in Queue, diese verarbeiten
      if (queueStore.pendingFiles.length > 0) {
        console.log('[Video Store] Processing queued files...')
        await queueStore.startProcessing()
        return
      }

      if (!this.selectedFiles.length || !this.ffmpeg) {
        console.log('[Video Store] No files selected or FFmpeg not loaded')
        return
      }

      try {
        console.log('[Video Store] Starting conversion to', format)
        this.isProcessing = true
        this.error = null
        this.totalFiles = this.selectedFiles.length
        this.loadingMessage = `Converting ${this.totalFiles} video files to ${format.toUpperCase()}...`

        const { fetchFile } = await import('@ffmpeg/util')

        // 🎯 OPTIMIERTE FFMPEG OPTIONEN!
        let options: string[]
        if (format === 'mp4') {
          // H.264 - SCHNELL!
          options = ['-c:v', 'libx264', '-crf', this.videoQuality.toString(), '-c:a', 'aac']
        } else {
          // VP9 - OPTIMIERT FÜR GESCHWINDIGKEIT!
          options = [
            '-c:v', 'libvpx-vp9',
            '-crf', this.videoQuality.toString(),
            '-speed', '8',        // 🚀 MAXIMUM SPEED!
            '-tile-columns', '6', // 🚀 PARALLEL PROCESSING!
            '-frame-parallel', '1', // 🚀 FRAME PARALLEL!
            '-threads', '8',      // 🚀 MORE THREADS!
            '-deadline', 'realtime', // 🚀 REALTIME MODE!
            '-cpu-used', '8',     // 🚀 FASTEST CPU PRESET!
            '-c:a', 'libopus'
          ]
        }
        
        console.log('[Video Store] Using FFmpeg options:', options)

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i]
          this.currentFile = i + 1
          this.loadingProgress = Math.round(((i + 1) / this.selectedFiles.length) * 100)
          
          if (format === 'webm') {
            this.loadingMessage = `Converting ${file.name} to WebM (VP9 is slow, please wait)...`
          } else {
            this.loadingMessage = `Converting ${file.name} to ${format.toUpperCase()}...`
          }
          
          console.log('[Video Store] Processing file:', file.name)
          
          // Write input file to FFmpeg's virtual filesystem
          const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
          const outputFileName = 'output.' + format
          console.log('[Video Store] Writing input file:', inputFileName)
          
          try {
            console.log('[Video Store] Fetching file data...')
            const fileData = await fetchFile(file)
            console.log('[Video Store] File data fetched, size:', fileData.byteLength)
            
            console.log('[Video Store] Writing to FFmpeg filesystem...')
            await this.ffmpeg.writeFile(inputFileName, fileData)
            console.log('[Video Store] Input file written successfully')
            
            // Verify file was written
            console.log('[Video Store] Verifying file...')
            const fileList = await this.ffmpeg.listDir('/')
            console.log('[Video Store] Files in FFmpeg filesystem:', fileList)
            
            if (!fileList.some((f: any) => f.name === inputFileName)) {
              throw new Error(`File ${inputFileName} was not found in FFmpeg filesystem after writing`)
            }
          } catch (writeError: unknown) {
            console.error('[Video Store] Failed to write input file:', writeError)
            throw new Error(`Failed to write input file: ${writeError instanceof Error ? writeError.message : String(writeError)}`)
          }

          // Run FFmpeg command
          console.log('[Video Store] Starting FFmpeg conversion...')
          const result = await this.ffmpeg.exec([
            '-i', inputFileName,
            ...options,
            outputFileName
          ])
          console.log('[Video Store] FFmpeg conversion finished with result:', result)

          // Read output file
          console.log('[Video Store] Reading output file...')
          const data = await this.ffmpeg.readFile(outputFileName, 'binary') as Uint8Array
          console.log('[Video Store] Output file read, size:', data.length)
          
          const blob = new Blob([data], { type: `video/${format}` })
          
          // Download the converted file
          console.log('[Video Store] Creating download...')
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${file.name.split('.')[0]}.${format}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          console.log('[Video Store] Download started')
        }

        // Clear files after successful conversion
        this.selectedFiles = []
        this.loadingMessage = 'Conversion completed!'
        console.log('[Video Store] Conversion completed successfully')
        
        setTimeout(() => {
          this.isProcessing = false
          this.loadingMessage = ''
          this.loadingProgress = 0
        }, 1000)
      } catch (err) {
        console.error('[Video Store] Conversion failed:', err)
        this.error = err instanceof Error ? err.message : 'Conversion failed'
        this.isProcessing = false
      }
    },

    async extractAudio() {
      const queueStore = useQueueStore()

      // Wenn Dateien in Queue, diese verarbeiten
      if (queueStore.pendingFiles.length > 0) {
        await queueStore.startProcessing()
        return
      }

      if (!this.selectedFiles.length || !this.ffmpeg) return

      try {
        this.isProcessing = true
        this.error = null
        this.totalFiles = this.selectedFiles.length
        this.loadingMessage = `Extracting audio from ${this.totalFiles} video files...`

        const { fetchFile } = await import('@ffmpeg/util')

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i]
          this.currentFile = i + 1
          this.loadingProgress = Math.round(((i + 1) / this.selectedFiles.length) * 100)
          this.loadingMessage = `Extracting audio from ${file.name}...`

          const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
          const outputFileName = 'output.mp3'
          
          await this.ffmpeg.writeFile(inputFileName, await fetchFile(file))

          // Extract audio
          await this.ffmpeg.exec([
            '-i', inputFileName,
            '-vn', // No video
            '-acodec', 'libmp3lame',
            '-q:a', '2', // High quality
            outputFileName
          ])

          const data = await this.ffmpeg.readFile(outputFileName)
          const blob = new Blob([data], { type: 'audio/mp3' })
          
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${file.name.split('.')[0]}.mp3`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }

        this.selectedFiles = []
        this.loadingMessage = 'Audio extraction completed!'
        
        setTimeout(() => {
          this.isProcessing = false
          this.loadingMessage = ''
          this.loadingProgress = 0
        }, 1000)
      } catch (err) {
        console.error('[Video Store] Audio extraction failed:', err)
        this.error = err instanceof Error ? err.message : 'Audio extraction failed'
        this.isProcessing = false
      }
    },

    async compressVideo() {
      const queueStore = useQueueStore()

      // Wenn Dateien in Queue, diese verarbeiten
      if (queueStore.pendingFiles.length > 0) {
        await queueStore.startProcessing()
        return
      }

      if (!this.selectedFiles.length || !this.ffmpeg) return

      try {
        this.isProcessing = true
        this.error = null
        this.totalFiles = this.selectedFiles.length
        this.loadingMessage = `Compressing ${this.totalFiles} video files...`

        const { fetchFile } = await import('@ffmpeg/util')

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i]
          this.currentFile = i + 1
          this.loadingProgress = Math.round(((i + 1) / this.selectedFiles.length) * 100)
          this.loadingMessage = `Compressing ${file.name}...`

          const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
          const outputFileName = 'output' + file.name.substring(file.name.lastIndexOf('.'))
          
          await this.ffmpeg.writeFile(inputFileName, await fetchFile(file))

          // Compress video with lower quality
          await this.ffmpeg.exec([
            '-i', inputFileName,
            '-c:v', 'libx264',
            '-crf', '28', // Higher CRF for compression
            '-preset', 'medium',
            '-c:a', 'aac',
            '-b:a', '128k',
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
        console.error('[Video Store] Compression failed:', err)
        this.error = err instanceof Error ? err.message : 'Compression failed'
        this.isProcessing = false
      }
    }
  }
})