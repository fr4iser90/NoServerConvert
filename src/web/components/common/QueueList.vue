<template>
  <div class="queue-list">
    <div class="queue-header">
      <h2>Processing Queue</h2>
      <div class="queue-stats">
        <span class="stat">{{ queueStore.files.length }} files</span>
        <span class="stat">{{ queueStore.totalProgress }}% complete</span>
      </div>
    </div>

    <div class="queue-controls">
      <button 
        v-if="queueStore.isProcessing"
        @click="queueStore.pauseProcessing()"
        class="control-btn pause"
      >
        ⏸️ Pause
      </button>
      <button 
        v-else-if="queueStore.pendingFiles.length > 0"
        @click="queueStore.startProcessing()"
        class="control-btn play"
      >
        ▶️ Start
      </button>
      
      <button 
        v-if="queueStore.completedFiles.length > 0"
        @click="queueStore.clearCompleted()"
        class="control-btn clear"
      >
        🗑️ Clear Completed ({{ queueStore.completedFiles.length }})
      </button>
      
      <button 
        v-if="queueStore.errorFiles.length > 0"
        @click="queueStore.clearErrors()"
        class="control-btn clear"
      >
        ❌ Clear Errors ({{ queueStore.errorFiles.length }})
      </button>
    </div>

    <div class="queue-items" v-if="queueStore.files.length > 0">
      <div 
        v-for="file in queueStore.files" 
        :key="file.id"
        class="queue-item"
        :class="file.status"
      >
        <div class="file-info">
          <div class="file-name">{{ file.file.name }}</div>
          <div class="file-meta">
            <span class="file-size">{{ formatFileSize(file.file.size) }}</span>
            <span class="file-type">{{ file.converter.toUpperCase() }}</span>
            <span class="status-badge" :class="file.status">
              {{ getStatusText(file.status) }}
            </span>
          </div>
        </div>

        <div class="progress-section" v-if="file.status === 'processing'">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${file.progress}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ file.progress }}%</span>
        </div>

        <div v-if="file.error" class="error-message">
          {{ file.error }}
        </div>

        <div class="file-actions">
          <button 
            v-if="file.status === 'error'"
            @click="queueStore.retryFile(file.id)"
            class="action-btn retry"
            title="Retry conversion"
          >
            🔄 Retry
          </button>
          
          <button 
            v-if="['pending', 'error'].includes(file.status)"
            @click="queueStore.removeFile(file.id)"
            class="action-btn remove"
            title="Remove from queue"
          >
            ❌ Remove
          </button>

          <select 
            v-if="file.status === 'pending'"
            :value="file.priority"
            @change="queueStore.setPriority(file.id, Number($event.target.value))"
            class="priority-select"
            title="Set priority"
          >
            <option value="10">High Priority</option>
            <option value="5">Normal Priority</option>
            <option value="1">Low Priority</option>
          </select>
        </div>
      </div>
    </div>

    <div v-else class="empty-queue">
      <p>No files in queue</p>
      <p class="hint">Upload files to start converting</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQueueStore, type QueuedFile } from '@web/stores/queue'

const queueStore = useQueueStore()

const getStatusText = (status: QueuedFile['status']) => {
  switch (status) {
    case 'pending': return 'Waiting'
    case 'processing': return 'Converting'
    case 'completed': return 'Done'
    case 'error': return 'Failed'
    case 'paused': return 'Paused'
    default: return status
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style lang="scss" scoped>
.queue-list {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  max-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.queue-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  
  h2 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    color: #2c3e50;
  }
}

.queue-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.queue-controls {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.control-btn {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.play {
    background: #d1e7dd;
    color: #0f5132;
    &:hover:not(:disabled) { 
      background: #badbcc; 
      transform: translateY(-1px);
    }
  }

  &.pause {
    background: #fff3cd;
    color: #664d03;
    &:hover:not(:disabled) { 
      background: #ffecb5; 
      transform: translateY(-1px);
    }
  }

  &.clear {
    background: #f8d7da;
    color: #842029;
    &:hover:not(:disabled) { 
      background: #f5c2c7; 
      transform: translateY(-1px);
    }
  }
}

.queue-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.queue-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 0.75rem;
  border-left: 4px solid #dee2e6;
  transition: all 0.2s;

  &.pending { border-left-color: #6c757d; }
  &.processing { 
    border-left-color: #0dcaf0; 
    background: #f0f9ff;
    animation: pulse 2s infinite;
  }
  &.completed { 
    border-left-color: #198754; 
    background: #f0f9f4;
  }
  &.error { 
    border-left-color: #dc3545; 
    background: #fff5f5;
  }
  &.paused { border-left-color: #fd7e14; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.file-info {
  margin-bottom: 0.5rem;
}

.file-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.875rem;
  word-break: break-all;
  margin-bottom: 0.25rem;
}

.file-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.75rem;
  color: #666;
}

.status-badge {
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;

  &.pending { background: #e9ecef; color: #495057; }
  &.processing { background: #cff4fc; color: #055160; }
  &.completed { background: #d1e7dd; color: #0f5132; }
  &.error { background: #f8d7da; color: #842029; }
  &.paused { background: #fff3cd; color: #664d03; }
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #3aa876);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.progress-text {
  font-size: 0.75rem;
  color: #666;
  min-width: 35px;
  font-weight: 500;
}

.error-message {
  background: #f8d7da;
  color: #842029;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &.retry {
    background: #fff3cd;
    color: #664d03;
    &:hover { 
      background: #ffecb5; 
      transform: translateY(-1px);
    }
  }

  &.remove {
    background: #f8d7da;
    color: #842029;
    &:hover { 
      background: #f5c2c7; 
      transform: translateY(-1px);
    }
  }
}

.priority-select {
  padding: 0.125rem 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.75rem;
  background: white;
}

.empty-queue {
  padding: 2rem;
  text-align: center;
  color: #666;

  .hint {
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
}
</style>