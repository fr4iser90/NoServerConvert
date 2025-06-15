<template>
  <div class="audio-converter">
    <h1>Audio Converter</h1>
    
    <div class="converter-content">
      <FileUpload
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
        hint="Maximum file size: 100MB"
        :max-size="100 * 1024 * 1024"
        :multiple="true"
        :max-files="10"
        @file-selected="handleFileSelected"
        @error="handleError"
      />

      <div v-if="appStore.currentFiles.length > 0" class="conversion-options">
        <h2>Conversion Options</h2>
        
        <div class="options-grid">
          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="convertToMp3"
          >
            <h3>Convert to MP3</h3>
            <p>Convert audio to MP3 format</p>
          </button>

          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="convertToWav"
          >
            <h3>Convert to WAV</h3>
            <p>Convert audio to WAV format</p>
          </button>

          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="convertToOgg"
          >
            <h3>Convert to OGG</h3>
            <p>Convert audio to OGG format</p>
          </button>

          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="compressAudio"
          >
            <h3>Compress Audio</h3>
            <p>Reduce audio file size</p>
          </button>
        </div>
      </div>

      <div v-if="appStore.error" class="error-message">
        {{ appStore.error }}
      </div>

      <div v-if="appStore.isProcessing" class="processing-overlay">
        <div class="processing-content">
          <div class="spinner"></div>
          <p>Processing your audio...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@shared/stores/app"
import FileUpload from "@components/common/FileUpload.vue"
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const appStore = useAppStore()
const ffmpeg = new FFmpeg()

function handleFileSelected(file: File) {
  console.log('[Audio Converter] File selected:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB')
  appStore.setCurrentFiles([file])
}

function handleError(message: string) {
  console.error('[Audio Converter] Error:', message)
  appStore.setError(message)
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
  if (!appStore.currentFiles[0]) return

  try {
    console.log(`[Audio Converter] Starting conversion to ${format}...`)
    appStore.setProcessing(true)
    appStore.setError(null)

    // Initialize FFmpeg if not already loaded
    await initFFmpeg()

    // Write input file to FFmpeg's virtual filesystem
    const inputFileName = 'input' + appStore.currentFiles[0].name.substring(appStore.currentFiles[0].name.lastIndexOf('.'))
    const outputFileName = 'output' + format
    console.log('[Audio Converter] Writing input file to FFmpeg filesystem:', inputFileName)
    await ffmpeg.writeFile(inputFileName, await fetchFile(appStore.currentFiles[0]))

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
    
    // Download the converted file
    console.log('[Audio Converter] Starting download...')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${appStore.currentFiles[0].name.split('.')[0]}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('[Audio Converter] Download completed')

  } catch (error) {
    console.error('[Audio Converter] Conversion failed:', error)
    appStore.setError(error instanceof Error ? error.message : 'Conversion failed')
  } finally {
    appStore.setProcessing(false)
  }
}

async function convertToMp3() {
  console.log('[Audio Converter] Converting to MP3...')
  await convertAudio('mp3', ['-codec:a', 'libmp3lame', '-qscale:a', '2'])
}

async function convertToWav() {
  console.log('[Audio Converter] Converting to WAV...')
  await convertAudio('wav', ['-codec:a', 'pcm_s16le'])
}

async function convertToOgg() {
  console.log('[Audio Converter] Converting to OGG...')
  await convertAudio('ogg', ['-codec:a', 'libvorbis', '-qscale:a', '6'])
}

async function convertToAac() {
  console.log('[Audio Converter] Converting to AAC...')
  await convertAudio('aac', ['-codec:a', 'aac', '-b:a', '192k'])
}

async function compressAudio() {
  if (!appStore.currentFiles[0]) return

  try {
    console.log('[Audio Converter] Starting audio compression...')
    appStore.setProcessing(true)
    appStore.setError(null)

    // Initialize FFmpeg if not already loaded
    await initFFmpeg()

    // Write input file to FFmpeg's virtual filesystem
    const inputFileName = 'input' + appStore.currentFiles[0].name.substring(appStore.currentFiles[0].name.lastIndexOf('.'))
    const outputFileName = 'output' + appStore.currentFiles[0].name.substring(appStore.currentFiles[0].name.lastIndexOf('.'))
    console.log('[Audio Converter] Writing input file to FFmpeg filesystem:', inputFileName)
    await ffmpeg.writeFile(inputFileName, await fetchFile(appStore.currentFiles[0]))

    // Compress audio
    console.log('[Audio Converter] Compressing audio...')
    await ffmpeg.exec([
      '-i', inputFileName,
      '-codec:a', 'libmp3lame',
      '-qscale:a', '4', // Compression quality (2-5 is good, higher = more compression)
      '-ar', '44100', // Sample rate
      outputFileName
    ])
    console.log('[Audio Converter] Audio compression completed')

    // Read the output file
    console.log('[Audio Converter] Reading output file...')
    const data = await ffmpeg.readFile(outputFileName)
    const blob = new Blob([data], { type: appStore.currentFiles[0].type })
    console.log('[Audio Converter] Output file size:', (blob.size / 1024 / 1024).toFixed(2) + 'MB')
    
    // Download the compressed file
    console.log('[Audio Converter] Starting download...')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compressed_${appStore.currentFiles[0].name}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('[Audio Converter] Download completed')

  } catch (error) {
    console.error('[Audio Converter] Compression failed:', error)
    appStore.setError(error instanceof Error ? error.message : 'Compression failed')
  } finally {
    appStore.setProcessing(false)
  }
}
</script>

<style lang="scss" scoped>
.audio-converter {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #2c3e50;
  }
}

.converter-content {
  position: relative;
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
</style> 