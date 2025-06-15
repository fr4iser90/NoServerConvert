<template>
  <div class="file-upload">
    <div 
      class="upload-area"
      :class="{ 'is-dragover': isDragover }"
      @dragenter.prevent="isDragover = true"
      @dragleave.prevent="isDragover = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        class="file-input"
        @change="handleFileChange"
      />
      
      <div class="upload-content">
        <div class="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p class="upload-text">
          {{ multiple ? 'Dateien hier ablegen oder klicken zum Auswählen' : 'Datei hier ablegen oder klicken zum Auswählen' }}
        </p>
        <p class="upload-hint">{{ hint }}</p>
      </div>
    </div>

    <div v-if="selectedFiles.length > 0" class="selected-files">
      <h3>Ausgewählte Dateien ({{ totalSize }} MB)</h3>
      <div class="file-list">
        <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
          <button class="remove-file" @click="removeFile(index)" title="Datei entfernen">
            ×
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  accept?: string
  hint?: string
  maxSize?: number // in bytes
  multiple?: boolean
  maxFiles?: number
}>()

const emit = defineEmits<{
  (e: 'file-selected', files: File[]): void
  (e: 'error', message: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)
const selectedFiles = ref<File[]>([])
const error = ref<string>('')

const totalSize = computed(() => {
  const total = selectedFiles.value.reduce((sum, file) => sum + file.size, 0)
  return (total / 1024 / 1024).toFixed(2)
})

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function validateFiles(files: File[]): File[] {
  const validFiles: File[] = []
  error.value = ''

  // Prüfe maximale Anzahl von Dateien
  if (props.maxFiles && files.length > props.maxFiles) {
    error.value = `Maximal ${props.maxFiles} Dateien erlaubt`
    emit('error', error.value)
    return []
  }

  // Prüfe jede Datei
  for (const file of files) {
    // Prüfe Dateigröße
    if (props.maxSize && file.size > props.maxSize) {
      error.value = `Datei "${file.name}" ist zu groß. Maximale Größe: ${formatFileSize(props.maxSize)}`
      emit('error', error.value)
      continue
    }

    // Prüfe Dateityp
    if (props.accept) {
      const acceptedTypes = props.accept.split(',').map(type => type.trim())
      const fileType = file.type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase()
        }
        if (type.endsWith('/*')) {
          const baseType = type.split('/')[0]
          return fileType.startsWith(baseType + '/')
        }
        return fileType === type
      })

      if (!isAccepted) {
        error.value = `Datei "${file.name}" hat ein nicht unterstütztes Format`
        emit('error', error.value)
        continue
      }
    }

    validFiles.push(file)
  }

  return validFiles
}

function handleFiles(files: FileList | File[]) {
  const fileArray = Array.from(files)
  const validFiles = validateFiles(fileArray)
  
  if (validFiles.length > 0) {
    if (props.multiple) {
      selectedFiles.value = [...selectedFiles.value, ...validFiles]
    } else {
      selectedFiles.value = validFiles
    }
    emit('file-selected', selectedFiles.value)
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    handleFiles(input.files)
  }
  // Reset input value to allow selecting the same file again
  input.value = ''
}

function handleDrop(event: DragEvent) {
  isDragover.value = false
  if (event.dataTransfer?.files) {
    handleFiles(event.dataTransfer.files)
  }
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1)
  emit('file-selected', selectedFiles.value)
}
</script>

<style lang="scss" scoped>
.file-upload {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;

  &:hover, &.is-dragover {
    border-color: #42b883;
    background: #f0f9f4;
  }
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  color: #42b883;
  width: 48px;
  height: 48px;
}

.upload-text {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.upload-hint {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.selected-files {
  margin-top: 1.5rem;

  h3 {
    margin: 0 0 0.5rem;
    color: #2c3e50;
    font-size: 1rem;
  }
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.875rem;
}

.file-name {
  flex: 1;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  color: #666;
  white-space: nowrap;
}

.remove-file {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0.5rem;
  line-height: 1;

  &:hover {
    color: #c82333;
  }
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee;
  color: #dc3545;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: center;
}
</style> 