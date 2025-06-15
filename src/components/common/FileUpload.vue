<template>
  <div class="file-upload" :class="{ 'is-dragging': isDragging }">
    <div
      class="upload-area"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        type="file"
        ref="fileInput"
        class="file-input"
        :accept="accept"
        @change="handleFileSelect"
      />
      
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <h3>Drop files here</h3>
        <p>or</p>
        <button class="upload-button" @click="triggerFileInput">
          Select Files
        </button>
        <p class="upload-hint">{{ hint }}</p>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'

const props = defineProps<{
  accept?: string
  hint?: string
  maxSize?: number // in bytes
}>()

const emit = defineEmits<{
  (e: 'file-selected', file: File): void
  (e: 'error', message: string): void
}>()

const appStore = useAppStore()
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const error = ref<string | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function validateFile(file: File): boolean {
  if (props.maxSize && file.size > props.maxSize) {
    error.value = `File size exceeds ${formatFileSize(props.maxSize)}`
    emit('error', error.value)
    return false
  }

  if (props.accept) {
    const acceptedTypes = props.accept.split(',').map(type => type.trim())
    const fileType = file.type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`

    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase()
      }
      return fileType.match(new RegExp(type.replace('*', '.*')))
    })

    if (!isValidType) {
      error.value = 'Invalid file type'
      emit('error', error.value)
      return false
    }
  }

  error.value = null
  return true
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (file && validateFile(file)) {
    appStore.setCurrentFile(file)
    emit('file-selected', file)
  }
  
  // Reset input
  input.value = ''
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  
  if (file && validateFile(file)) {
    appStore.setCurrentFile(file)
    emit('file-selected', file)
  }
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`
}
</script>

<style lang="scss" scoped>
.file-upload {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: #fff;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #42b883;
    background: #f8f9fa;
  }

  &.is-dragging {
    border-color: #42b883;
    background: #f0f9f4;
  }
}

.file-input {
  display: none;
}

.upload-content {
  .upload-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }

  p {
    color: #666;
    margin: 0.5rem 0;
  }
}

.upload-button {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #3aa876;
  }
}

.upload-hint {
  font-size: 0.875rem;
  color: #999;
  margin-top: 1rem;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
}
</style> 