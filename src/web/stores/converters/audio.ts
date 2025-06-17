import { defineStore } from 'pinia'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { useQueueStore } from '@web/stores/queue'

// Use the same CDN URLs wie im offiziellen Vue-Vite-Demo
const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm'

interface AudioState {
  selectedFiles: File[]
  error: string | null
  isProcessing: boolean
  audioFormat: string
  audioQuality: number
  ffmpeg: FFmpeg | null
}

export const useAudioStore = defineStore('audio-converter', {
  state: (): AudioState => ({
    selectedFiles: [],
    error: null,
    isProcessing: false,
    audioFormat: 'mp3',
    audioQuality: 2, // FFmpeg quality setting (0-9, lower is better)
    ffmpeg: null
  }),

  actions: {
    async initFFmpeg() {
      if (this.ffmpeg?.loaded) {
        console.log('[Audio Store] FFmpeg already loaded')
        return
      }

      try {
        console.log('[Audio Store] Loading FFmpeg core...')
        this.ffmpeg = new FFmpeg()
        
        // Add event listeners for logging
        this.ffmpeg.on('log', ({ message }) => {
          console.log('[FFmpeg]', message)
        })
        
        this.ffmpeg.on('progress', ({ progress, time }) => {
          console.log('[FFmpeg] Progress:', progress, 'Time:', time)
        })
        
        // Load FFmpeg with proper core URLs
        await this.ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        })

        if (!this.ffmpeg.loaded) {
          throw new Error('FFmpeg failed to load properly')
        }
        
        console.log('[Audio Store] FFmpeg core loaded successfully')
      } catch (error) {
        console.error('[Audio Store] Failed to load FFmpeg:', error)
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
        this.isProcessing = true
        this.error = null

        // FFmpeg Optionen basierend auf Format
        const options = format === 'mp3' ? ['-c:a', 'libmp3lame', '-q:a', this.audioQuality.toString()] :
                       format === 'wav' ? ['-c:a', 'pcm_s16le'] :
                       ['-c:a', 'libvorbis', '-q:a', this.audioQuality.toString()]

        for (const file of this.selectedFiles) {
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
      } catch (err) {
        console.error('[Audio Store] Conversion failed:', err)
        this.error = err instanceof Error ? err.message : 'Conversion failed'
      } finally {
        this.isProcessing = false
      }
    },

    async compressAudio() {
      if (!this.selectedFiles.length || !this.ffmpeg) return

      try {
        this.isProcessing = true
        this.error = null

        for (const file of this.selectedFiles) {
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
      } catch (err) {
        console.error('[Audio Store] Compression failed:', err)
        this.error = err instanceof Error ? err.message : 'Compression failed'
      } finally {
        this.isProcessing = false
      }
    }
  }
}) 