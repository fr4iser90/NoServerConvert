<template>
  <div class="converter-layout">
    <div class="converter-main">
      <h1>PDF Converter</h1>
      
      <FileUpload
        accept=".pdf"
        hint="Maximal 10 Dateien, je 100MB"
        :max-size="100 * 1024 * 1024"
        :multiple="true"
        :max-files="10"
        @files-selected="pdfStore.handleFilesSelected"
      />

      <FileList 
        :files="pdfStore.selectedFiles"
        title="Ausgewählte Dateien:"
        @remove="pdfStore.removeFile"
      />

      <ConversionOptions
        :files="pdfStore.selectedFiles"
        :use-zip="pdfStore.useZip"
        :image-format="pdfStore.imageFormat"
        @convert="pdfStore.startConversion"
      />

      <div v-if="pdfStore.error" class="error-message">
        {{ pdfStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FileUpload from '@web/components/common/FileUpload.vue'
import FileList from '@web/components/common/FileList.vue'
import ConversionOptions from '@/web/components/converters/document/pdf/ConversionOptions.vue'
import { usePdfStore } from '@shared/converters/modules/document/pdf/PdfConverter'

const pdfStore = usePdfStore()
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
</style> 