<template>
  <div class="converter-container">
    <div class="converter-main">
      <h1>Video Converter</h1>
      
      <FileUpload
        accept="video/*,.mp4,.webm,.avi,.mov,.mkv"
        :max-size="1024 * 1024 * 1024"
        hint="Select video files (max 1GB)"
        @files-selected="videoStore.handleFilesSelected"
      />

      <FileList
        :files="videoStore.selectedFiles"
        :is-processing="videoStore.isProcessing"
        @remove-file="videoStore.removeFile"
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

    <div class="queue-sidebar" v-if="queueStore.queue.length > 0">
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

const videoStore = useVideoStore()
const queueStore = useQueueStore()

onMounted(async () => {
  try {
    await videoStore.initFFmpeg()
  } catch (error) {
    console.error('Failed to initialize video converter:', error)
  }
})
</script>

<style lang="scss" scoped>
.converter-container {
  display: flex;
  gap: 2rem;
  height: 100%;
  padding: 2rem;
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
  }
}

.queue-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}
</style> 