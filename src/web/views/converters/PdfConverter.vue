<template>
  <div class="converter-layout">
    <div class="converter-main">
      <h1>PDF Converter</h1>
      
      <FileUpload
        accept=".pdf"
        hint="Unlimited files supported - auto-queued for batch processing"
        :max-size="100 * 1024 * 1024"
        :multiple="true"
        :max-files="10"
        converter-type="pdf"
        @files-selected="handleFilesSelected"
        @files-queued="handleFilesQueued"
        @error="handleError"
      />

      <FileList 
        :files="pdfStore.selectedFiles"
        title="Ready for Conversion:"
        @remove="pdfStore.removeFile"
      />

      <ConversionOptions
        :files="pdfStore.selectedFiles"
        :use-zip="pdfStore.useZip"
        :image-format="pdfStore.imageFormat"
        @convert="handleConvert"
      />

      <div v-if="pdfStore.error" class="error-message">
        {{ pdfStore.error }}
      </div>
    </div>

    <aside class="queue-sidebar">
      <QueueList />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { usePdfStore } from '@web/stores/converters/pdf'
import { useQueueStore } from '@web/stores/queue'
import FileUpload from '@web/components/common/FileUpload.vue'
import FileList from '@web/components/common/FileList.vue'
import QueueList from '@web/components/common/QueueList.vue'
import ConversionOptions from '@web/components/converters/document/pdf/ConversionOptions.vue'

const pdfStore = usePdfStore()
const queueStore = useQueueStore()

function handleFilesSelected(files: File[]) {
  pdfStore.handleFilesSelected(files)
}

function handleFilesQueued(files: File[], converterType: string) {
  // Add files to queue with PDF converter options
  queueStore.addFiles(files, converterType, {
    format: 'image',
    imageFormat: pdfStore.imageFormat,
    useZip: pdfStore.useZip
  })
}

function handleError(message: string) {
  pdfStore.error = message
}

function handleConvert(type: 'image' | 'text' | 'html') {
  // Start conversion for immediate files
  pdfStore.startConversion(type)
  
  // Also update queue options and start queue processing
  queueStore.updateQueueOptions('pdf', {
    format: type,
    imageFormat: pdfStore.imageFormat,
    useZip: pdfStore.useZip
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