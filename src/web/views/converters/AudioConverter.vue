<template>
  <div class="converter-layout">
    <div class="converter-main">
      <h1>Audio Converter</h1>
      
      <div class="upload-section">
        <FileUpload
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
          hint="Maximum file size: 100MB"
          :max-size="100 * 1024 * 1024"
          :multiple="true"
          :max-files="10"
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
            @click="convertToMp3"
          >
            <h3>Convert to MP3</h3>
            <p>Convert audio to MP3 format</p>
          </button>

          <button
            class="option-card"
            :disabled="!queueStore.pendingFiles.length"
            @click="convertToWav"
          >
            <h3>Convert to WAV</h3>
            <p>Convert audio to WAV format</p>
          </button>

          <button
            class="option-card"
            :disabled="!queueStore.pendingFiles.length"
            @click="convertToOgg"
          >
            <h3>Convert to OGG</h3>
            <p>Convert audio to OGG format</p>
          </button>

          <button
            class="option-card"
            :disabled="!queueStore.pendingFiles.length"
            @click="compressAudio"
          >
            <h3>Compress Audio</h3>
            <p>Reduce audio file size</p>
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
  queueStore.addFiles(files, 'audio', {})
}

function handleError(message: string) {
  error.value = message
  console.error('[Audio Converter] Error:', message)
}

// Initialize FFmpeg
async function initFFmpeg() {
  if (ffmpeg.loaded) {
    console.log('[Audio Converter] FFmpeg already loaded')
    return
  }

  try {
    console.log('[Audio Converter] Loading FFmpeg core...')
    // Load FFmpeg core
    await ffmpeg.load({
      coreURL: await toBlobURL(`/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, 'application/wasm'),
    })
    console.log('[Audio Converter] FFmpeg core loaded successfully')
  } catch (error) {
    console.error('[Audio Converter] Failed to load FFmpeg:', error)
    throw new Error('Failed to initialize audio converter')
  }
}

async function convertAudio(format: string, options: string[] = []) {
  if (!queueStore.pendingFiles.length) return

  try {
    console.log(`[Audio Converter] Starting conversion to ${format}...`)
    queueStore.startProcessing()
    error.value = null

    for (const queuedFile of queueStore.pendingFiles) {
      const file = queuedFile.file
      queueStore.updateFileStatus(queuedFile.id, 'processing', 0)

      // Initialize FFmpeg if not already loaded
      await initFFmpeg()

      // Write input file to FFmpeg's virtual filesystem
      const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
      const outputFileName = 'output' + format
      console.log('[Audio Converter] Writing input file to FFmpeg filesystem:', inputFileName)
      await ffmpeg.writeFile(inputFileName, await fetchFile(file))

      // Run FFmpeg command
      console.log('[Audio Converter] Running FFmpeg command with options:', options)
      await ffmpeg.exec([
        '-i', inputFileName,
        ...options,
        outputFileName
      ])
      console.log('[Audio Converter] FFmpeg command completed')

      // Read the output file
      console.log('[Audio Converter] Reading output file...')
      const data = await ffmpeg.readFile(outputFileName)
      const blob = new Blob([data], { type: `audio/${format}` })
      console.log('[Audio Converter] Output file size:', (blob.size / 1024 / 1024).toFixed(2) + 'MB')
      
      // Set the converted file in the queue
      queueStore.setConvertedFile(queuedFile.id, blob, `${file.name.split('.')[0]}.${format}`)
      
      // Download the converted file
      console.log('[Audio Converter] Starting download...')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${file.name.split('.')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log('[Audio Converter] Download completed')
    }

  } catch (err) {
    console.error('[Audio Converter] Conversion failed:', err)
    error.value = err instanceof Error ? err.message : 'Conversion failed'
    for (const queuedFile of queueStore.pendingFiles) {
      queueStore.updateFileStatus(queuedFile.id, 'error', 0, error.value)
    }
  } finally {
    queueStore.stopProcessing()
  }
}

async function convertToMp3() {
  await convertAudio('mp3', ['-c:a', 'libmp3lame', '-q:a', '2'])
}

async function convertToWav() {
  await convertAudio('wav', ['-c:a', 'pcm_s16le'])
}

async function convertToOgg() {
  await convertAudio('ogg', ['-c:a', 'libvorbis', '-q:a', '4'])
}

async function compressAudio() {
  if (!queueStore.pendingFiles.length) return

  try {
    console.log('[Audio Converter] Starting audio compression...')
    queueStore.startProcessing()
    error.value = null

    for (const queuedFile of queueStore.pendingFiles) {
      const file = queuedFile.file
      queueStore.updateFileStatus(queuedFile.id, 'processing', 0)

      // Initialize FFmpeg if not already loaded
      await initFFmpeg()

      // Write input file to FFmpeg's virtual filesystem
      const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
      const outputFileName = 'output' + file.name.substring(file.name.lastIndexOf('.'))
      console.log('[Audio Converter] Writing input file to FFmpeg filesystem:', inputFileName)
      await ffmpeg.writeFile(inputFileName, await fetchFile(file))

      // Compress audio
      console.log('[Audio Converter] Compressing audio...')
      await ffmpeg.exec([
        '-i', inputFileName,
        '-c:a', 'libmp3lame',
        '-q:a', '4', // Lower quality for smaller file size
        '-ar', '44100', // Standard sample rate
        '-ac', '2', // Stereo
        outputFileName
      ])
      console.log('[Audio Converter] Audio compression completed')

      // Read the output file
      console.log('[Audio Converter] Reading output file...')
      const data = await ffmpeg.readFile(outputFileName)
      const blob = new Blob([data], { type: file.type })
      console.log('[Audio Converter] Output file size:', (blob.size / 1024 / 1024).toFixed(2) + 'MB')
      
      // Set the converted file in the queue
      queueStore.setConvertedFile(queuedFile.id, blob, `compressed_${file.name}`)
      
      // Download the compressed file
      console.log('[Audio Converter] Starting download...')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `compressed_${file.name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log('[Audio Converter] Download completed')
    }

  } catch (err) {
    console.error('[Audio Converter] Compression failed:', err)
    error.value = err instanceof Error ? err.message : 'Compression failed'
    for (const queuedFile of queueStore.pendingFiles) {
      queueStore.updateFileStatus(queuedFile.id, 'error', 0, error.value)
    }
  } finally {
    queueStore.stopProcessing()
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

.queue-sidebar {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}
</style> 