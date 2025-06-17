<template>
  <div class="queue-sidebar" v-if="queueStore.queue.length > 0">
    <div class="queue-header">
      <h2>Processing Queue</h2>
      <div class="queue-actions">
        <button 
          v-if="queueStore.completedFiles.length > 0"
          @click="queueStore.clearCompleted"
          class="clear-button"
        >
          Clear Completed
        </button>
        <button 
          v-if="queueStore.errorFiles.length > 0"
          @click="queueStore.clearErrors"
          class="clear-button"
        >
          Clear Errors
        </button>
      </div>
    </div>

    <div class="queue-list">
      <div 
        v-for="file in queueStore.queue" 
        :key="file.id"
        class="queue-item"
        :class="file.status"
      >
        <div class="file-info">
          <span class="file-name">{{ file.file.name }}</span>
          <span class="file-type">{{ file.type }}</span>
        </div>

        <div class="status-info">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${file.progress}%` }"
            ></div>
          </div>
          <span class="status-text">{{ getStatusText(file.status) }}</span>
        </div>

        <div v-if="file.error" class="error-text">
          {{ file.error }}
        </div>

        <button 
          v-if="file.status === 'completed'"
          @click="downloadFile(file)"
          class="download-button"
        >
          Download
        </button>

        <button 
          v-if="['pending', 'error'].includes(file.status)"
          @click="queueStore.removeFile(file.id)"
          class="remove-button"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQueueStore, type QueuedFile } from '@web/stores/queue'

const queueStore = useQueueStore()

const getStatusText = (status: QueuedFile['status']) => {
  switch (status) {
    case 'pending': return 'Waiting...'
    case 'processing': return 'Processing...'
    case 'completed': return 'Completed'
    case 'error': return 'Error'
    default: return status
  }
}

const downloadFile = (file: QueuedFile) => {
  if (!file.convertedFile || !file.convertedName) return

  const url = URL.createObjectURL(file.convertedFile)
  const a = document.createElement('a')
  a.href = url
  a.download = file.convertedName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style lang="scss" scoped>
.queue-sidebar {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
  width: 100%;
}

.queue-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.1rem;
    color: #2c3e50;
  }
}

.queue-actions {
  display: flex;
  gap: 0.5rem;
}

.clear-button {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: #666;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
}

.queue-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.queue-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.processing {
    background: #e3f2fd;
  }

  &.completed {
    background: #e8f5e9;
  }

  &.error {
    background: #ffebee;
  }
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;

  .file-name {
    font-weight: 500;
    color: #2c3e50;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 70%;
  }

  .file-type {
    color: #666;
    text-transform: uppercase;
    font-size: 0.75rem;
  }
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.progress-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #42b883;
  transition: width 0.3s ease;
}

.status-text {
  font-size: 0.75rem;
  color: #666;
}

.error-text {
  font-size: 0.75rem;
  color: #dc2626;
}

.download-button,
.remove-button {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-end;
}

.download-button {
  background: #42b883;
  color: white;

  &:hover {
    background: #3aa876;
  }
}

.remove-button {
  background: #fee2e2;
  color: #dc2626;

  &:hover {
    background: #fecaca;
  }
}
</style> 