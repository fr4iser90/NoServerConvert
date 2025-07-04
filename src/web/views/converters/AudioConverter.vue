<template>
  <div class="converter-layout">
    <!-- Loading Overlay -->
    <LoadingSpinner
      v-if="audioStore.isProcessing"
      overlay
      size="large"
      title="Audio Converter"
      :message="audioStore.loadingMessage"
      :progress="audioStore.loadingProgress"
      :file-count="audioStore.totalFiles"
      :current-file="audioStore.currentFile"
      cancellable
      @cancel="cancelConversion"
    />

    <div class="converter-main">
      <h1>Audio Converter</h1>
      
      <div class="upload-section">
        <FileUpload
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
          hint="Unlimited files supported - auto-queued for batch processing"
          :max-size="100 * 1024 * 1024"
          :multiple="true"
          :max-files="10"
          converter-type="audio"
          :disabled="audioStore.isProcessing"
          @files-selected="handleFilesSelected"
          @files-queued="handleFilesQueued"
          @error="handleError"
        />
      </div>

      <FileList
        :files="audioStore.selectedFiles"
        @remove="(file) => audioStore.removeFile(file)"
      />

      <ConversionOptions
        :files="audioStore.selectedFiles"
        :is-processing="audioStore.isProcessing"
        @convert="handleConvert"
        @compress="handleCompress"
      />

      <div v-if="audioStore.error" class="error-message">
        {{ audioStore.error }}
      </div>
    </div>

    <aside class="queue-sidebar">
      <QueueList />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useAudioStore } from '@web/stores/converters/audio'
import { useQueueStore } from '@web/stores/queue'
import FileUpload from '@web/components/common/FileUpload.vue'
import FileList from '@web/components/common/FileList.vue'
import QueueList from '@web/components/common/QueueList.vue'
import LoadingSpinner from '@web/components/common/LoadingSpinner.vue'
import ConversionOptions from '@web/components/converters/audio/ConversionOptions.vue'
import { onMounted } from 'vue'

const audioStore = useAudioStore()
const queueStore = useQueueStore()

onMounted(async () => {
  await audioStore.initFFmpeg()
})

function handleFilesSelected(files: File[]) {
  audioStore.handleFilesSelected(files)
}

function handleFilesQueued(files: File[], converterType: string) {
  // Add files to queue with audio converter options
  queueStore.addFiles(files, converterType, {
    format: 'mp3',
    quality: audioStore.audioQuality
  })
}

function handleError(message: string) {
  audioStore.error = message
}

async function handleConvert(format: 'mp3' | 'wav' | 'ogg') {
  await audioStore.startConversion(format)
  
  // Update queue options
  queueStore.updateQueueOptions('audio', {
    format,
    quality: audioStore.audioQuality
  })
}

async function handleCompress() {
  await audioStore.compressAudio()
  
  // Update queue options
  queueStore.updateQueueOptions('audio', {
    format: 'compress'
  })
}

function cancelConversion() {
  audioStore.isProcessing = false
  audioStore.loadingMessage = ''
  audioStore.loadingProgress = 0
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

.upload-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 2rem;
  
  // 🎯 MOBILE UPLOAD SECTION
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
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