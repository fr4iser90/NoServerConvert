<template>
  <div class="video-converter">
    <h1>Video Converter</h1>
    
    <div class="converter-content">
      <FileUpload
        accept="video/*,.mp4,.webm,.avi,.mov,.mkv"
        hint="Maximum file size: 500MB"
        :max-size="500 * 1024 * 1024"
        @file-selected="handleFileSelected"
        @error="handleError"
      />

      <div v-if="appStore.currentFile" class="conversion-options">
        <h2>Conversion Options</h2>
        
        <div class="options-grid">
          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="convertToMp4"
          >
            <h3>Convert to MP4</h3>
            <p>Convert video to MP4 format</p>
          </button>

          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="convertToWebm"
          >
            <h3>Convert to WebM</h3>
            <p>Convert video to WebM format</p>
          </button>

          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="extractAudio"
          >
            <h3>Extract Audio</h3>
            <p>Extract audio from video</p>
          </button>

          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="compressVideo"
          >
            <h3>Compress Video</h3>
            <p>Reduce video file size</p>
          </button>
        </div>
      </div>

      <div v-if="appStore.error" class="error-message">
        {{ appStore.error }}
      </div>

      <div v-if="appStore.isProcessing" class="processing-overlay">
        <div class="processing-content">
          <div class="spinner"></div>
          <p>Processing your video...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import FileUpload from '@/components/common/FileUpload.vue'

const appStore = useAppStore()

function handleFileSelected(file: File) {
  // File is already set in the store by FileUpload component
  console.log('File selected:', file.name)
}

function handleError(message: string) {
  appStore.setError(message)
}

async function convertToMp4() {
  try {
    appStore.setProcessing(true)
    appStore.setError(null)
    // TODO: Implement MP4 conversion
    await new Promise(resolve => setTimeout(resolve, 1000)) // Placeholder
  } catch (error) {
    appStore.setError(error instanceof Error ? error.message : 'Conversion failed')
  } finally {
    appStore.setProcessing(false)
  }
}

async function convertToWebm() {
  try {
    appStore.setProcessing(true)
    appStore.setError(null)
    // TODO: Implement WebM conversion
    await new Promise(resolve => setTimeout(resolve, 1000)) // Placeholder
  } catch (error) {
    appStore.setError(error instanceof Error ? error.message : 'Conversion failed')
  } finally {
    appStore.setProcessing(false)
  }
}

async function extractAudio() {
  try {
    appStore.setProcessing(true)
    appStore.setError(null)
    // TODO: Implement audio extraction
    await new Promise(resolve => setTimeout(resolve, 1000)) // Placeholder
  } catch (error) {
    appStore.setError(error instanceof Error ? error.message : 'Extraction failed')
  } finally {
    appStore.setProcessing(false)
  }
}

async function compressVideo() {
  try {
    appStore.setProcessing(true)
    appStore.setError(null)
    // TODO: Implement video compression
    await new Promise(resolve => setTimeout(resolve, 1000)) // Placeholder
  } catch (error) {
    appStore.setError(error instanceof Error ? error.message : 'Compression failed')
  } finally {
    appStore.setProcessing(false)
  }
}
</script>

<style lang="scss" scoped>
.video-converter {
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