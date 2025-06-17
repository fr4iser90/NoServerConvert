<template>
  <div class="converter-container">
    <!-- Loading Overlay -->
    <LoadingSpinner
      v-if="videoStore.isProcessing"
      overlay
      size="large"
      title="Video Converter"
      :message="videoStore.loadingMessage"
      :progress="videoStore.loadingProgress"
      :file-count="videoStore.totalFiles"
      :current-file="videoStore.currentFile"
      cancellable
      @cancel="cancelConversion"
    />

    <div class="converter-main">
      <h1>Video Converter</h1>
      
      <FileUpload
        accept="video/*,.mp4,.webm,.avi,.mov,.mkv"
        :max-size="1024 * 1024 * 1024"
        hint="Unlimited files supported - auto-queued for batch processing"
        :multiple="true"
        :max-files="5"
        converter-type="video"
        :disabled="videoStore.isProcessing"
        @files-selected="handleFilesSelected"
        @files-queued="handleFilesQueued"
        @error="handleError"
      />

      <FileList
        :files="videoStore.selectedFiles"
        title="Ready for Conversion:"
        @remove="videoStore.removeFile"
      />

      <ConversionOptions
        :files="videoStore.selectedFiles"
        :is-processing="videoStore.isProcessing"
        @convert="handleConvert"
        @extract-audio="handleExtractAudio"
        @compress="handleCompress"
      />

      <div v-if="videoStore.error" class="error-message">
        {{ videoStore.error }}
      </div>
    </div>

    <div class="queue-sidebar">
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

function handleFilesSelected(files: File[]) {
  videoStore.handleFilesSelected(files)
}

function handleFilesQueued(files: File[], converterType: string) {
  // Add files to queue with video converter options
  queueStore.addFiles(files, converterType, {
    format: 'mp4',
    quality: videoStore.videoQuality
  })
}

function handleError(message: string) {
  videoStore.error = message
}

function handleConvert(format: 'mp4' | 'webm') {
  videoStore.startConversion(format)
  
  // Update queue options
  queueStore.updateQueueOptions('video', {
    format,
    quality: videoStore.videoQuality
  })
}

function handleExtractAudio() {
  videoStore.extractAudio()
  
  // Update queue options
  queueStore.updateQueueOptions('video', {
    format: 'extract-audio'
  })
}

function handleCompress() {
  videoStore.compressVideo()
  
  // Update queue options
  queueStore.updateQueueOptions('video', {
    format: 'compress'
  })
}

function cancelConversion() {
  videoStore.isProcessing = false
  videoStore.loadingMessage = ''
  videoStore.loadingProgress = 0
}
</script>

<style lang="scss" scoped>
.converter-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 140px);
}

.converter-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 1rem;
  }
}

.queue-sidebar {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}
</style>