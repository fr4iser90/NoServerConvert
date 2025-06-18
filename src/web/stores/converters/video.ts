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

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i]
          this.currentFile = i + 1
          this.loadingProgress = Math.round(((i + 1) / this.selectedFiles.length) * 100)
          
          if (format === 'webm') {
            this.loadingMessage = `Converting ${file.name} to WebM (this may take several minutes)...`
          } else {
            this.loadingMessage = `Converting ${file.name} to ${format.toUpperCase()}...`
          }
          
          console.log('[Video Store] Processing file:', file.name)
          
          // 🎯 OPTIMIZED CONVERSION LOGIC
          const result = await this.convertSingleFile(file, format)
          
          if (result.success) {
            // Download the converted file
            console.log('[Video Store] Creating download...')
            const url = URL.createObjectURL(result.blob!)
            const a = document.createElement('a')
            a.href = url
            a.download = `${file.name.split('.')[0]}.${format}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            console.log('[Video Store] Download started')
          } else {
            throw new Error(result.error || 'Conversion failed')
          }
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

    // 🎯 NEW: OPTIMIZED SINGLE FILE CONVERSION
    async convertSingleFile(file: File, format: 'mp4' | 'webm'): Promise<{success: boolean, blob?: Blob, error?: string}> {
      try {
        const { fetchFile } = await import('@ffmpeg/util')
        
        // Prepare file names
        const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
        const outputFileName = 'output.' + format
        
        console.log('[Video Store] Writing input file:', inputFileName)
        
        // Write input file
        try {
          const fileData = await fetchFile(file)
          console.log('[Video Store] File data fetched, size:', fileData.byteLength)
          
          await this.ffmpeg.writeFile(inputFileName, fileData)
          console.log('[Video Store] Input file written successfully')
          
          // Verify file was written
          const fileList = await this.ffmpeg.listDir('/')
          if (!fileList.some((f: any) => f.name === inputFileName)) {
            throw new Error(`File ${inputFileName} was not found in FFmpeg filesystem after writing`)
          }
        } catch (writeError) {
          console.error('[Video Store] Failed to write input file:', writeError)
          return { success: false, error: `Failed to write input file: ${writeError instanceof Error ? writeError.message : String(writeError)}` }
        }

        // 🎯 OPTIMIZED FFMPEG OPTIONS FOR EACH FORMAT
        let ffmpegArgs: string[]
        
        if (format === 'mp4') {
          // H.264 - FAST AND RELIABLE - SPEED OPTIMIZED
          ffmpegArgs = [
            '-i', inputFileName,
            '-c:v', 'libx264',
            '-crf', Math.min(this.videoQuality + 5, 35).toString(), // Higher CRF for speed
            '-preset', 'ultrafast', // FASTEST preset instead of medium
            '-tune', 'fastdecode', // Optimize for fast decoding
            '-c:a', 'aac',
            '-movflags', '+faststart', // Optimize for web playback
            outputFileName
          ]
        } else {
          // WebM VP9 - HEAVILY OPTIMIZED FOR SPEED AND COMPATIBILITY  
          ffmpegArgs = [
            '-i', inputFileName,
            '-c:v', 'libvpx-vp9',
            '-crf', Math.min(this.videoQuality + 10, 40).toString(), // Much higher CRF for WebM speed
            '-speed', '8',              // Maximum speed
            '-deadline', 'realtime',    // Realtime encoding for speed
            '-cpu-used', '8',           // Fastest CPU preset
            '-threads', '2',            // Limit threads for single-threaded FFmpeg
            '-tile-columns', '1',       // Reduced complexity
            '-frame-parallel', '0',     // Disable for single-thread
            '-row-mt', '0',             // Disable row multithreading
            '-auto-alt-ref', '1',       // Alternative reference frames
            '-lag-in-frames', '0',      // No lag for maximum speed
            '-error-resilient', '1',    // Error resilience
            '-c:a', 'libopus',
            '-b:a', '128k',             // Fixed audio bitrate
            outputFileName
          ]
        }
        
        console.log('[Video Store] Using FFmpeg options:', ffmpegArgs)

        // Run FFmpeg conversion - NO TIMEOUT FOR LARGE FILES!
        console.log('[Video Store] Starting FFmpeg conversion...')
        
        try {
          await this.ffmpeg.exec(ffmpegArgs)
          console.log('[Video Store] FFmpeg conversion finished successfully')
        } catch (conversionError) {
          console.error('[Video Store] FFmpeg conversion failed:', conversionError)
          return { success: false, error: `Conversion failed: ${conversionError instanceof Error ? conversionError.message : String(conversionError)}` }
        }

        // Verify output file exists
        console.log('[Video Store] Verifying output file exists...')
        try {
          const outputFileList = await this.ffmpeg.listDir('/')
          console.log('[Video Store] Files in FFmpeg filesystem after conversion:', outputFileList)
          
          const outputFileExists = outputFileList.some((f: any) => f.name === outputFileName)
          if (!outputFileExists) {
            console.error('[Video Store] Output file not found in filesystem')
            return { success: false, error: `Conversion failed: Output file '${outputFileName}' was not created. This may be due to an unsupported codec or corrupted input file.` }
          }
        } catch (listError) {
          console.error('[Video Store] Failed to list output files:', listError)
          return { success: false, error: `Failed to verify output file: ${listError instanceof Error ? listError.message : String(listError)}` }
        }

        // Read output file
        console.log('[Video Store] Reading output file...')
        try {
          const data = await this.ffmpeg.readFile(outputFileName, 'binary') as Uint8Array
          console.log('[Video Store] Output file read, size:', data.length)
          
          if (data.length === 0) {
            return { success: false, error: `Output file '${outputFileName}' is empty. Conversion may have failed due to codec issues or corrupted input.` }
          }
          
          const blob = new Blob([data], { type: `video/${format}` })
          
          // Clean up FFmpeg filesystem
          try {
            await this.ffmpeg.deleteFile(inputFileName)
            await this.ffmpeg.deleteFile(outputFileName)
          } catch (cleanupError) {
            console.warn('[Video Store] Failed to cleanup files:', cleanupError)
            // Non-critical error, continue
          }
          
          return { success: true, blob }
          
        } catch (readError) {
          console.error('[Video Store] Failed to read output file:', readError)
          return { success: false, error: `Failed to read converted file: ${readError instanceof Error ? readError.message : String(readError)}` }
        }
        
      } catch (error) {
        console.error('[Video Store] Conversion error:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown conversion error' }
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

          // Verify output file exists before reading
          const outputFileList = await this.ffmpeg.listDir('/')
          const outputFileExists = outputFileList.some((f: any) => f.name === outputFileName)
          if (!outputFileExists) {
            throw new Error(`Audio extraction failed: Output file '${outputFileName}' was not created.`)
          }

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
            '-crf', '30', // Higher CRF for faster compression
            '-preset', 'ultrafast', // FASTEST preset for compression
            '-tune', 'fastdecode', // Fast decoding optimization
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart', // Web optimization
            outputFileName
          ])

          // Verify output file exists before reading
          const outputFileList = await this.ffmpeg.listDir('/')
          const outputFileExists = outputFileList.some((f: any) => f.name === outputFileName)
          if (!outputFileExists) {
            throw new Error(`Video compression failed: Output file '${outputFileName}' was not created.`)
          }

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