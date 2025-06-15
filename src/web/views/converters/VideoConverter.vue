<template>
  <div class="converter-layout">
    <div class="converter-main">
      <h1>Video Converter</h1>
      
      <div class="upload-section">
        <FileUpload
          accept="video/*,.mp4,.webm,.avi,.mov,.mkv"
          hint="Maximum file size: 500MB"
          :max-size="500 * 1024 * 1024"
          :multiple="true"
          :max-files="5"
          @file-selected="handleFilesSelected"
          @error="handleError"
        />
      </div>

      <div class="conversion-options">
        <h2>Conversion Options</h2>
        
        <div class="options-grid">
          <button
            class="option-card"
            :disabled="!queueStore.pendingFiles.length"
            @click="convertToMp4"
          >
            <h3>Convert to MP4</h3>
            <p>Convert video to MP4 format</p>
          </button>

          <button
            class="option-card"
            :disabled="!queueStore.pendingFiles.length"
            @click="convertToWebm"
          >
            <h3>Convert to WebM</h3>
            <p>Convert video to WebM format</p>
          </button>

          <button
            class="option-card"
            :disabled="!queueStore.pendingFiles.length"
            @click="extractAudio"
          >
            <h3>Extract Audio</h3>
            <p>Extract audio from video</p>
          </button>

          <button
            class="option-card"
            :disabled="!queueStore.pendingFiles.length"
            @click="compressVideo"
          >
            <h3>Compress Video</h3>
            <p>Reduce video file size</p>
          </button>
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <aside class="queue-sidebar">
      <QueueList />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useQueueStore, type QueuedFile } from '@shared/stores/queue'
import FileUpload from '@web/components/common/FileUpload.vue'
import QueueList from '@web/components/queue/QueueList.vue'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { ref } from 'vue'

const queueStore = useQueueStore()
const ffmpeg = new FFmpeg()
const error = ref<string | null>(null)

function handleFilesSelected(files: File[]) {
  queueStore.addFiles(files, 'video', {})
}

function handleError(message: string) {
  error.value = message
  console.error('[Video Converter] Error:', message)
}

// Initialize FFmpeg
async function initFFmpeg() {
  if (ffmpeg.loaded) {
    console.log('[Video Converter] FFmpeg already loaded')
    return
  }

  try {
    console.log('[Video Converter] Loading FFmpeg core...')
    // Load FFmpeg core
    await ffmpeg.load({
      coreURL: await toBlobURL(`/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, 'application/wasm'),
    })
    console.log('[Video Converter] FFmpeg core loaded successfully')
  } catch (error) {
    console.error('[Video Converter] Failed to load FFmpeg:', error)
    throw new Error('Failed to initialize video converter')
  }
}

async function convertVideo(format: string, options: string[] = []) {
  if (!queueStore.pendingFiles.length) return

  try {
    console.log(`[Video Converter] Starting conversion to ${format}...`)
    queueStore.startProcessing()
    error.value = null

    const queuedFile = queueStore.pendingFiles[0]
    const file = queuedFile.file
    queueStore.updateFileStatus(queuedFile.id, 'processing', 0)

    // Initialize FFmpeg if not already loaded
    await initFFmpeg()

    // Write input file to FFmpeg's virtual filesystem
    const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
    const outputFileName = 'output' + format
    console.log('[Video Converter] Writing input file to FFmpeg filesystem:', inputFileName)
    await ffmpeg.writeFile(inputFileName, await fetchFile(file))

    // Run FFmpeg command
    console.log('[Video Converter] Running FFmpeg command with options:', options)
    await ffmpeg.exec([
      '-i', inputFileName,
      ...options,
      outputFileName
    ])
    console.log('[Video Converter] FFmpeg command completed')

    // Read the output file
    console.log('[Video Converter] Reading output file...')
    const data = await ffmpeg.readFile(outputFileName)
    const blob = new Blob([data], { type: `video/${format}` })
    console.log('[Video Converter] Output file size:', (blob.size / 1024 / 1024).toFixed(2) + 'MB')
    
    // Set the converted file in the queue
    queueStore.setConvertedFile(queuedFile.id, blob, `${file.name.split('.')[0]}.${format}`)
    
    // Download the converted file
    console.log('[Video Converter] Starting download...')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${file.name.split('.')[0]}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('[Video Converter] Download completed')

  } catch (err) {
    console.error('[Video Converter] Conversion failed:', err)
    error.value = err instanceof Error ? err.message : 'Conversion failed'
    if (queueStore.pendingFiles[0]) {
      queueStore.updateFileStatus(queueStore.pendingFiles[0].id, 'error', 0, error.value)
    }
  } finally {
    queueStore.stopProcessing()
  }
}

async function convertToMp4() {
  console.log('[Video Converter] Converting to MP4...')
  await convertVideo('mp4', ['-c:v', 'libx264', '-c:a', 'aac'])
}

async function convertToWebm() {
  console.log('[Video Converter] Converting to WebM...')
  await convertVideo('webm', ['-c:v', 'libvpx-vp9', '-c:a', 'libopus'])
}

async function extractAudio() {
  if (!queueStore.pendingFiles.length) return

  try {
    console.log('[Video Converter] Starting audio extraction...')
    queueStore.setProcessing(true)
    queueStore.setError(null)

    // Initialize FFmpeg if not already loaded
    await initFFmpeg()

    // Write input file to FFmpeg's virtual filesystem
    const inputFileName = 'input' + queueStore.pendingFiles[0].name.substring(queueStore.pendingFiles[0].name.lastIndexOf('.'))
    const outputFileName = 'output.mp3'
    console.log('[Video Converter] Writing input file to FFmpeg filesystem:', inputFileName)
    await ffmpeg.writeFile(inputFileName, await fetchFile(queueStore.pendingFiles[0]))

    // Extract audio
    console.log('[Video Converter] Extracting audio...')
    await ffmpeg.exec([
      '-i', inputFileName,
      '-vn', // No video
      '-acodec', 'libmp3lame',
      '-q:a', '2', // High quality
      outputFileName
    ])
    console.log('[Video Converter] Audio extraction completed')

    // Read the output file
    console.log('[Video Converter] Reading output file...')
    const data = await ffmpeg.readFile(outputFileName)
    const blob = new Blob([data], { type: 'audio/mp3' })
    console.log('[Video Converter] Output file size:', (blob.size / 1024 / 1024).toFixed(2) + 'MB')
    
    // Download the extracted audio
    console.log('[Video Converter] Starting download...')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${queueStore.pendingFiles[0].name.split('.')[0]}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('[Video Converter] Download completed')

  } catch (error) {
    console.error('[Video Converter] Audio extraction failed:', error)
    queueStore.setError(error instanceof Error ? error.message : 'Extraction failed')
  } finally {
    queueStore.setProcessing(false)
  }
}

async function compressVideo() {
  if (!queueStore.pendingFiles.length) return

  try {
    console.log('[Video Converter] Starting video compression...')
    queueStore.setProcessing(true)
    queueStore.setError(null)

    // Initialize FFmpeg if not already loaded
    await initFFmpeg()

    // Write input file to FFmpeg's virtual filesystem
    const inputFileName = 'input' + queueStore.pendingFiles[0].name.substring(queueStore.pendingFiles[0].name.lastIndexOf('.'))
    const outputFileName = 'output' + queueStore.pendingFiles[0].name.substring(queueStore.pendingFiles[0].name.lastIndexOf('.'))
    console.log('[Video Converter] Writing input file to FFmpeg filesystem:', inputFileName)
    await ffmpeg.writeFile(inputFileName, await fetchFile(queueStore.pendingFiles[0]))

    // Compress video
    console.log('[Video Converter] Compressing video...')
    await ffmpeg.exec([
      '-i', inputFileName,
      '-c:v', 'libx264',
      '-crf', '28', // Compression factor (lower = better quality, higher = smaller file)
      '-preset', 'medium', // Encoding speed preset
      '-c:a', 'aac',
      '-b:a', '128k', // Audio bitrate
      outputFileName
    ])
    console.log('[Video Converter] Video compression completed')

    // Read the output file
    console.log('[Video Converter] Reading output file...')
    const data = await ffmpeg.readFile(outputFileName)
    const blob = new Blob([data], { type: queueStore.pendingFiles[0].type })
    console.log('[Video Converter] Output file size:', (blob.size / 1024 / 1024).toFixed(2) + 'MB')
    
    // Download the compressed file
    console.log('[Video Converter] Starting download...')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compressed_${queueStore.pendingFiles[0].name}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('[Video Converter] Download completed')

  } catch (error) {
    console.error('[Video Converter] Compression failed:', error)
    queueStore.setError(error instanceof Error ? error.message : 'Compression failed')
  } finally {
    queueStore.setProcessing(false)
  }
}
</script>

<style lang="scss" scoped>
.converter-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 140px);
}

.converter-main {
  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #2c3e50;
  }
}

.upload-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 2rem;
}

.conversion-options {
  margin-top: 2rem;

  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #2c3e50;
  }
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.option-card {
  background: #fff;
  border: none;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    margin: 0;
    font-size: 0.875rem;
  }
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee;
  color: #dc3545;
  border-radius: 4px;
  text-align: center;
}

.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.processing-content {
  text-align: center;

  .spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 1rem;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #42b883;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    color: #2c3e50;
    font-size: 1.1rem;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.queue-sidebar {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}
</style> 