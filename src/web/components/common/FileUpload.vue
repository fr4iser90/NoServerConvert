<template>
  <div 
    class="file-upload"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
    @click="triggerFileSelect"
    :class="{ 'is-dragging': isDragging }"
  >
    <input
      type="file"
      ref="fileInput"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileSelect"
      class="file-input"
    />
    
    <div class="upload-content">
      <div class="upload-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      
      <div class="upload-text">
        <p class="primary-text">Drop files here or click to upload</p>
        <p class="secondary-text">
          {{ accept ? `Accepted formats: ${accept}` : 'All files accepted' }}
          {{ multiple ? ' (Multiple files allowed)' : '' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  accept?: string
  multiple?: boolean
}>()

const emit = defineEmits<{
  (e: 'files-selected', files: File[]): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    emit('files-selected', Array.from(input.files))
    input.value = '' // Reset input
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    emit('files-selected', Array.from(event.dataTransfer.files))
  }
}

function triggerFileSelect() {
  fileInput.value?.click()
}
</script>

<style lang="scss" scoped>
.file-upload {
  position: relative;
  width: 100%;
  min-height: 200px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #42b883;
    background: #f0f9f4;
  }

  &.is-dragging {
    border-color: #42b883;
    background: #e8f5e9;
  }
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
  padding: 1rem;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: #42b883;

  svg {
    width: 100%;
    height: 100%;
  }
}

.upload-text {
  .primary-text {
    font-size: 1.125rem;
    font-weight: 500;
    color: #2c3e50;
    margin: 0 0 0.5rem;
  }

  .secondary-text {
    font-size: 0.875rem;
    color: #666;
    margin: 0;
  }
}
</style> 