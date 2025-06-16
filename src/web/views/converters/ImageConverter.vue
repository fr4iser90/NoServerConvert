<template>
  <div class="converter-layout">
    <div class="converter-main">
      <h1>Image Converter</h1>
      
      <FileUpload
        accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff"
        hint="Maximum file size: 50MB"
        :max-size="50 * 1024 * 1024"
        :multiple="true"
        :max-files="10"
        @files-selected="imageStore.handleFilesSelected"
      />

      <FileList 
        :files="imageStore.selectedFiles"
        title="Selected Files:"
        @remove="imageStore.removeFile"
      />

      <ConversionOptions
        :files="imageStore.selectedFiles"
        :is-processing="imageStore.isProcessing"
        @convert="imageStore.startConversion"
      />

      <div v-if="imageStore.error" class="error-message">
        {{ imageStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FileUpload from '@web/components/common/FileUpload.vue'
import FileList from '@web/components/common/FileList.vue'
import ConversionOptions from '@web/components/converters/image/basic/ConversionOptions.vue'
import { useImageStore } from '@web/stores/converters/image'

const imageStore = useImageStore()
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