<template>
  <div class="converter-layout">
    <!-- Loading Overlay -->
    <LoadingSpinner
      v-if="imageStore.isProcessing"
      overlay
      size="large"
      title="Image Converter"
      :message="imageStore.loadingMessage"
      :progress="imageStore.loadingProgress"
      :file-count="imageStore.totalFiles"
      :current-file="imageStore.currentFile"
      cancellable
      @cancel="cancelConversion"
    />

    <div class="converter-main">
      <h1>Image Converter</h1>
      
      <FileUpload
        accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff"
        hint="Unlimited files supported - auto-queued for batch processing"
        :max-size="50 * 1024 * 1024"
        :multiple="true"
        :max-files="10"
        converter-type="image"
        :disabled="imageStore.isProcessing"
        @files-selected="handleFilesSelected"
        @files-queued="handleFilesQueued"
        @error="handleError"
      />

      <FileList 
        :files="imageStore.selectedFiles"
        title="Ready for Conversion:"
        @remove="imageStore.removeFile"
      />

      <ConversionOptions
        :files="imageStore.selectedFiles"
        :is-processing="imageStore.isProcessing"
        @convert="handleConvert"
      />

      <div v-if="imageStore.error" class="error-message">
        {{ imageStore.error }}
      </div>
    </div>

    <aside class="queue-sidebar">
      <QueueList />
    </aside>
  </div>
</template>

<script setup lang="ts">
import FileUpload from '@web/components/common/FileUpload.vue'
import FileList from '@web/components/common/FileList.vue'
import QueueList from '@web/components/common/QueueList.vue'
import LoadingSpinner from '@web/components/common/LoadingSpinner.vue'
import ConversionOptions from '@web/components/converters/image/basic/ConversionOptions.vue'
import { useImageStore } from '@web/stores/converters/image'
import { useQueueStore } from '@web/stores/queue'

const imageStore = useImageStore()
const queueStore = useQueueStore()

function handleFilesSelected(files: File[]) {
  imageStore.handleFilesSelected(files)
}

function handleFilesQueued(files: File[], converterType: string) {
  // Add files to queue with image converter options
  queueStore.addFiles(files, converterType, {
    format: 'png',
    quality: imageStore.imageQuality
  })
}

function handleError(message: string) {
  imageStore.error = message
}

function handleConvert(format: 'jpg' | 'png' | 'webp') {
  imageStore.startConversion(format)
  
  // Update queue options
  queueStore.updateQueueOptions('image', {
    format,
    quality: imageStore.imageQuality
  })
}

function cancelConversion() {
  imageStore.isProcessing = false
  imageStore.loadingMessage = ''
  imageStore.loadingProgress = 0
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
  
  // 🎯 MOBILE RESPONSIVE LAYOUT
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
    min-height: auto;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    gap: 0.75rem;
  }
}

.converter-main {
  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #2c3e50;
    
    // 🎯 MOBILE TYPOGRAPHY
    @media (max-width: 768px) {
      font-size: 1.75rem;
      margin-bottom: 1.5rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  }
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee;
  color: #dc3545;
  border-radius: 4px;
  text-align: center;
  
  // 🎯 MOBILE ERROR MESSAGE
  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.875rem;
    margin-top: 0.75rem;
    border-radius: 6px;
  }
}

.queue-sidebar {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
  
  // 🎯 MOBILE QUEUE SIDEBAR
  @media (max-width: 768px) {
    position: static;
    order: -1; // Move queue to top on mobile
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
}
</style>