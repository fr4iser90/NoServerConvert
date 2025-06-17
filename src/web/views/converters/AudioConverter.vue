<template>
  <div class="converter-layout">
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