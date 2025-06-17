<template>
  <div 
    class="file-upload"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileSelect"
    :class="{ 
      'is-dragging': isDragging,
      'has-error': error,
      'is-disabled': disabled
    }"
  >
    <input
      type="file"
      ref="fileInput"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileSelect"
      class="file-input"
      :disabled="disabled"
    />
    
    <div class="upload-content">
      <div class="upload-icon">
        <svg v-if="!isDragging" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      
      <div class="upload-text">
        <p class="primary-text">
          {{ isDragging ? 'Drop files here' : 'Drop files here or click to upload' }}
        </p>
        <p class="secondary-text">
          {{ formatAcceptedFormats() }}
          {{ multiple ? ` (up to ${maxFiles} files)` : '' }}
        </p>
        <p v-if="hint" class="hint-text">{{ hint }}</p>
      </div>
    </div>

    <div v-if="error" class="upload-error">
      {{ error }}
    </div>

    <!-- Progress indicator for large files -->
    <div v-if="isProcessing" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <span class="progress-text">Processing files... {{ progress }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ErrorHandler, ErrorType } from '@shared/utils/errorHandler'

const props = defineProps<{
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  hint?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'files-selected', files: File[]): void
  (e: 'error', message: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const error = ref<string | null>(null)
const isProcessing = ref(false)
const progress = ref(0)

const formatAcceptedFormats = () => {
  if (!props.accept) return 'All file types accepted'
  
  const formats = props.accept.split(',').map(format => format.trim())
  const extensions = formats.filter(f => f.startsWith('.')).map(f => f.substring(1).toUpperCase())
  const mimeTypes = formats.filter(f => !f.startsWith('.'))
  
  let result = ''
  if (extensions.length > 0) {
    result += extensions.join(', ')
  }
  if (mimeTypes.length > 0) {
    if (result) result += ' and '
    result += mimeTypes.map(type => {
      if (type.includes('image')) return 'images'
      if (type.includes('video')) return 'videos'
      if (type.includes('audio')) return 'audio'
      if (type.includes('pdf')) return 'PDFs'
      return type
    }).join(', ')
  }
  
  return result || 'Supported formats'
}

function handleDragOver(event: DragEvent) {
  if (props.disabled) return
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function handleDragLeave(event: DragEvent) {
  if (props.disabled) return
  // Only set to false if we're leaving the drop zone entirely
  if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
    isDragging.value = false
  }
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    processFiles(Array.from(input.files))
    input.value = '' // Reset input
  }
}

function handleDrop(event: DragEvent) {
  if (props.disabled) return
  isDragging.value = false
  if (event.dataTransfer?.files) {
    processFiles(Array.from(event.dataTransfer.files))
  }
}

async function processFiles(files: File[]) {
  error.value = null
  
  try {
    // Validate file count
    if (props.maxFiles && files.length > props.maxFiles) {
      throw new Error(`Too many files. Maximum ${props.maxFiles} files allowed.`)
    }

    // Validate each file
    const validFiles: File[] = []
    for (const file of files) {
      try {
        validateFile(file)
        validFiles.push(file)
      } catch (fileError) {
        ErrorHandler.handleFileError(file, fileError)
        emit('error', `${file.name}: ${fileError instanceof Error ? fileError.message : 'Invalid file'}`)
      }
    }

    if (validFiles.length === 0) {
      throw new Error('No valid files selected')
    }

    // Show progress for large files
    if (validFiles.some(file => file.size > 10 * 1024 * 1024)) {
      isProcessing.value = true
      progress.value = 0
      
      // Simulate processing progress
      const interval = setInterval(() => {
        progress.value += 10
        if (progress.value >= 100) {
          clearInterval(interval)
          isProcessing.value = false
          progress.value = 0
        }
      }, 100)
    }

    emit('files-selected', validFiles)
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'File processing failed'
    emit('error', error.value)
  }
}

function validateFile(file: File) {
  // Check file size
  if (props.maxSize && file.size > props.maxSize) {
    throw ErrorHandler.createError(
      ErrorType.FILE_TOO_LARGE,
      `File too large: ${formatFileSize(file.size)} (max: ${formatFileSize(props.maxSize)})`,
      undefined,
      file.name
    )
  }

  // Check file type
  if (props.accept) {
    const acceptedTypes = props.accept.split(',').map(type => type.trim())
    const isAccepted = acceptedTypes.some(acceptedType => {
      if (acceptedType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(acceptedType.toLowerCase())
      }
      return file.type.match(acceptedType.replace('*', '.*'))
    })

    if (!isAccepted) {
      throw ErrorHandler.createError(
        ErrorType.INVALID_FORMAT,
        `File type not supported: ${file.type || 'unknown'}`,
        `Accepted types: ${props.accept}`,
        file.name
      )
    }
  }

  // Check for empty files
  if (file.size === 0) {
    throw ErrorHandler.createError(
      ErrorType.INVALID_FORMAT,
      'File is empty',
      undefined,
      file.name
    )
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function triggerFileSelect() {
  if (!props.disabled) {
    fileInput.value?.click()
  }
}
</script>

<style lang="scss" scoped>
.file-upload {
  position: relative;
  width: 100%;
  min-height: 200px;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  background: #f7fafc;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;

  &:hover:not(.is-disabled) {
    border-color: #4299e1;
    background: #ebf8ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
  }

  &.is-dragging {
    border-color: #38b2ac;
    background: #e6fffa;
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(56, 178, 172, 0.15);
  }

  &.has-error {
    border-color: #e53e3e;
    background: #fff5f5;
  }

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #edf2f7;
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

  &:disabled {
    cursor: not-allowed;
  }
}

.upload-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 90%;
  padding: 1rem;
}

.upload-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: #4299e1;
  transition: all 0.3s ease;

  .is-dragging & {
    color: #38b2ac;
    transform: scale(1.1);
  }

  svg {
    width: 100%;
    height: 100%;
  }
}

.upload-text {
  .primary-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 0.5rem;
    transition: color 0.3s ease;

    .is-dragging & {
      color: #38b2ac;
    }
  }

  .secondary-text {
    font-size: 0.875rem;
    color: #718096;
    margin: 0 0 0.25rem;
  }

  .hint-text {
    font-size: 0.75rem;
    color: #a0aec0;
    margin: 0;
    font-style: italic;
  }
}

.upload-error {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fed7d7;
  color: #742a2a;
  padding: 0.75rem;
  font-size: 0.875rem;
  text-align: center;
}

.upload-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #edf2f7;
  padding: 0.75rem;
}

.progress-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #4299e1;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #4a5568;
  text-align: center;
}
</style>