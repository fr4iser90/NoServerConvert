<template>
  <div class="converter-container">
    <!-- Advanced Loading Spinner with Progress -->
    <LoadingSpinner
      v-if="videoStore.isProcessing"
      overlay
      size="large"
      title="Video Converter"
      :message="videoStore.loadingMessage"
      :progress="videoStore.loadingProgress"
      :file-count="videoStore.totalFiles"
      :current-file="videoStore.currentFile"
      :cancellable="true"
      @cancel="cancelConversion"
    />

    <div class="converter-main">
      <h1>Video Converter</h1>
      
      <FileUpload
        accept="video/*,.mp4,.webm,.avi,.mov,.mkv"
        :max-size="1024 * 1024 * 1024"
        hint="Select video files (max 1GB)"
        :multiple="true"
        :max-files="5"
        :disabled="videoStore.isProcessing"
        @files-selected="videoStore.handleFilesSelected"
        @error="handleError"
      />

      <FileList
        :files="videoStore.selectedFiles"
        @remove="videoStore.removeFile"
      />

      <ConversionOptions
        :files="videoStore.selectedFiles"
        :is-processing="videoStore.isProcessing"
        @convert="videoStore.startConversion"
        @extract-audio="videoStore.extractAudio"
        @compress="videoStore.compressVideo"
      />

      <div v-if="videoStore.error" class="error-message">
        {{ videoStore.error }}
      </div>
    </div>

    <div class="queue-sidebar" v-if="queueStore.files.length > 0">
      <QueueList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useVideoStore } from '@web/stores/converters/video'
import { useQueueStore } from '@web/stores/queue'
import FileUpload from '@web/components/common/FileUpload.vue'
import FileList from '@web/components/common/FileList.vue'
import ConversionOptions from '@web/components/converters/video/ConversionOptions.vue'
import QueueList from '@web/components/common/QueueList.vue'
import LoadingSpinner from '@web/components/common/LoadingSpinner.vue'

const videoStore = useVideoStore()
const queueStore = useQueueStore()

onMounted(async () => {
  try {
    await videoStore.initFFmpeg()
  } catch (error) {
    console.error('Failed to initialize video converter:', error)
  }
})

function handleError(message: string) {
  videoStore.error = message
}

function cancelConversion() {
  videoStore.cancelConversion()
}
</script>

<style lang="scss" scoped>
.converter-container {
  display: flex;
  gap: 2rem;
  height: 100%;
  padding: 2rem;
  
  // 🎯 MOBILE RESPONSIVE
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    height: auto;
    min-height: 100vh;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    gap: 0.5rem;
  }
}

.converter-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 1rem;
    
    // 🎯 MOBILE TYPOGRAPHY
    @media (max-width: 768px) {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
    }
  }
  
  // 🎯 MOBILE SPACING
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
}

.queue-sidebar {
  width: 300px;
  flex-shrink: 0;
  
  // 🎯 MOBILE QUEUE SIDEBAR
  @media (max-width: 768px) {
    width: 100%;
    order: -1; // Move queue to top on mobile
  }
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  
  // 🎯 MOBILE ERROR MESSAGE
  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
}
</style>