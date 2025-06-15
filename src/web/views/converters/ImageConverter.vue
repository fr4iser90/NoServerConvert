<template>
  <div class="converter-layout">
    <div class="converter-main">
      <h1>Image Converter</h1>
      
      <div class="upload-section">
        <FileUpload
          accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff"
          hint="Maximum file size: 50MB"
          :max-size="50 * 1024 * 1024"
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
            @click="convertToJpg"
          >
            <h3>Convert to JPG</h3>
            <p>Convert image to JPG format</p>
          </button>

          <button
            class="option-card"
            :disabled="!queueStore.pendingFiles.length"
            @click="convertToPng"
          >
            <h3>Convert to PNG</h3>
            <p>Convert image to PNG format</p>
          </button>

          <button
            class="option-card"
            :disabled="!queueStore.pendingFiles.length"
            @click="convertToWebp"
          >
            <h3>Convert to WebP</h3>
            <p>Convert image to WebP format</p>
          </button>

          <button
            class="option-card"
            :disabled="!queueStore.pendingFiles.length"
            @click="compressImage"
          >
            <h3>Compress Image</h3>
            <p>Reduce image file size</p>
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
import { ref } from 'vue'

const queueStore = useQueueStore()
const error = ref<string | null>(null)

function handleFilesSelected(files: File[]) {
  // Validiere, dass alle Dateien das gleiche Format haben
  const firstFileType = files[0]?.type.split('/')[1]
  const allSameType = files.every(file => file.type.split('/')[1] === firstFileType)
  
  if (!allSameType) {
    error.value = 'Bitte wähle nur Dateien im gleichen Format aus'
    return
  }

  queueStore.addFiles(files, 'image', {})
}

function handleError(message: string) {
  error.value = message
  console.error('[Image Converter] Error:', message)
}

async function convertImage(format: string, quality?: number) {
  if (!queueStore.pendingFiles.length) return

  try {
    queueStore.startProcessing()
    error.value = null

    for (const queuedFile of queueStore.pendingFiles) {
      const file = queuedFile.file
      queueStore.updateFileStatus(queuedFile.id, 'processing', 0)

      // Create an image element
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = objectUrl
      })

      // Create canvas with image dimensions
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Draw image on canvas
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(objectUrl)

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Could not create image blob')
        
        // Set the converted file in the queue
        queueStore.setConvertedFile(queuedFile.id, blob, `${file.name.split('.')[0]}.${format.split('/')[1]}`)
        
        // Download the file
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${file.name.split('.')[0]}.${format.split('/')[1]}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, format, quality)
    }

  } catch (err) {
    console.error('[Image Converter] Conversion failed:', err)
    error.value = err instanceof Error ? err.message : 'Conversion failed'
    for (const queuedFile of queueStore.pendingFiles) {
      queueStore.updateFileStatus(queuedFile.id, 'error', 0, error.value)
    }
  } finally {
    queueStore.stopProcessing()
  }
}

async function convertToJpg() {
  await convertImage('image/jpeg', 0.9)
}

async function convertToPng() {
  await convertImage('image/png')
}

async function convertToWebp() {
  await convertImage('image/webp', 0.9)
}

async function compressImage() {
  if (!queueStore.pendingFiles.length) return

  try {
    queueStore.startProcessing()
    error.value = null

    for (const queuedFile of queueStore.pendingFiles) {
      const file = queuedFile.file
      queueStore.updateFileStatus(queuedFile.id, 'processing', 0)

      // Create an image element
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = objectUrl
      })

      // Create canvas with image dimensions
      const canvas = document.createElement('canvas')
      const maxDimension = 1920 // Max width/height
      let width = img.width
      let height = img.height

      // Scale down if image is too large
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else {
          width = (width * maxDimension) / height
          height = maxDimension
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Draw image on canvas with new dimensions
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(objectUrl)

      // Convert to blob and download with compression
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Could not create image blob')
        
        // Set the converted file in the queue
        queueStore.setConvertedFile(queuedFile.id, blob, `compressed_${file.name}`)
        
        // Download the file
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `compressed_${file.name}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, file.type, 0.8) // 80% quality
    }

  } catch (err) {
    console.error('[Image Converter] Compression failed:', err)
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