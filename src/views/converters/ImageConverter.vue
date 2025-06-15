<template>
  <div class="image-converter">
    <h1>Image Converter</h1>
    
    <div class="converter-content">
      <FileUpload
        accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff"
        hint="Maximum file size: 50MB"
        :max-size="50 * 1024 * 1024"
        @file-selected="handleFileSelected"
        @error="handleError"
      />

      <div v-if="appStore.currentFile" class="conversion-options">
        <h2>Conversion Options</h2>
        
        <div class="options-grid">
          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="convertToJpg"
          >
            <h3>Convert to JPG</h3>
            <p>Convert image to JPG format</p>
          </button>

          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="convertToPng"
          >
            <h3>Convert to PNG</h3>
            <p>Convert image to PNG format</p>
          </button>

          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="convertToWebp"
          >
            <h3>Convert to WebP</h3>
            <p>Convert image to WebP format</p>
          </button>

          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="compressImage"
          >
            <h3>Compress Image</h3>
            <p>Reduce image file size</p>
          </button>
        </div>
      </div>

      <div v-if="appStore.error" class="error-message">
        {{ appStore.error }}
      </div>

      <div v-if="appStore.isProcessing" class="processing-overlay">
        <div class="processing-content">
          <div class="spinner"></div>
          <p>Processing your image...</p>
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

async function convertToJpg() {
  try {
    appStore.setProcessing(true)
    appStore.setError(null)
    // TODO: Implement JPG conversion
    await new Promise(resolve => setTimeout(resolve, 1000)) // Placeholder
  } catch (error) {
    appStore.setError(error instanceof Error ? error.message : 'Conversion failed')
  } finally {
    appStore.setProcessing(false)
  }
}

async function convertToPng() {
  try {
    appStore.setProcessing(true)
    appStore.setError(null)
    // TODO: Implement PNG conversion
    await new Promise(resolve => setTimeout(resolve, 1000)) // Placeholder
  } catch (error) {
    appStore.setError(error instanceof Error ? error.message : 'Conversion failed')
  } finally {
    appStore.setProcessing(false)
  }
}

async function convertToWebp() {
  try {
    appStore.setProcessing(true)
    appStore.setError(null)
    // TODO: Implement WebP conversion
    await new Promise(resolve => setTimeout(resolve, 1000)) // Placeholder
  } catch (error) {
    appStore.setError(error instanceof Error ? error.message : 'Conversion failed')
  } finally {
    appStore.setProcessing(false)
  }
}

async function compressImage() {
  try {
    appStore.setProcessing(true)
    appStore.setError(null)
    // TODO: Implement image compression
    await new Promise(resolve => setTimeout(resolve, 1000)) // Placeholder
  } catch (error) {
    appStore.setError(error instanceof Error ? error.message : 'Compression failed')
  } finally {
    appStore.setProcessing(false)
  }
}
</script>

<style lang="scss" scoped>
.image-converter {
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