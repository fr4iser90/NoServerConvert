<template>
  <div class="queue-list">
    <h2>Conversion Queue</h2>
    
    <div v-if="queueStore.pendingFiles.length === 0" class="empty-queue">
      <p>No files in queue</p>
      <p class="hint">Drop files to start converting</p>
    </div>

    <div v-else class="queue-items">
      <div v-for="file in queueStore.pendingFiles" :key="file.id" class="queue-item">
        <div class="file-info">
          <span class="filename">{{ file.file.name }}</span>
          <span class="status" :class="file.status">{{ file.status }}</span>
        </div>
        
        <div class="progress-bar" v-if="file.status === 'processing'">
          <div class="progress" :style="{ width: `${file.progress}%` }"></div>
        </div>

        <div class="actions">
          <button 
            v-if="file.status === 'pending'"
            class="action-button remove"
            @click="queueStore.removeFile(file.id)"
            title="Remove from queue"
          >
            Remove
          </button>
          <button 
            v-if="file.status === 'completed'"
            class="action-button download"
            @click="downloadFile(file)"
            title="Download converted file"
          >
            Download
          </button>
        </div>
      </div>
    </div>

    <div class="queue-summary" v-if="queueStore.pendingFiles.length > 0">
      <div class="summary-item">
        <span>Pending:</span>
        <span>{{ pendingCount }}</span>
      </div>
      <div class="summary-item">
        <span>Processing:</span>
        <span>{{ processingCount }}</span>
      </div>
      <div class="summary-item">
        <span>Completed:</span>
        <span>{{ completedCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQueueStore } from '@shared/stores/queue'

const queueStore = useQueueStore()

const pendingCount = computed(() => 
  queueStore.pendingFiles.filter(f => f.status === 'pending').length
)

const processingCount = computed(() => 
  queueStore.pendingFiles.filter(f => f.status === 'processing').length
)

const completedCount = computed(() => 
  queueStore.pendingFiles.filter(f => f.status === 'completed').length
)

function downloadFile(file: any) {
  if (file.convertedBlob) {
    const url = URL.createObjectURL(file.convertedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.convertedName || `converted-${file.name}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
</script>

<style lang="scss" scoped>
.queue-list {
  padding: 1rem;

  h2 {
    margin: 0 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #eee;
    color: #2c3e50;
    font-size: 1.25rem;
  }
}

.empty-queue {
  text-align: center;
  padding: 2rem 1rem;
  color: #666;

  .hint {
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
}

.queue-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.queue-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 0.75rem;
  border: 1px solid #eee;

  .file-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;

    .filename {
      font-size: 0.875rem;
      color: #2c3e50;
      word-break: break-all;
    }

    .status {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      text-transform: capitalize;

      &.pending {
        background: #e9ecef;
        color: #495057;
      }

      &.processing {
        background: #cff4fc;
        color: #055160;
      }

      &.completed {
        background: #d1e7dd;
        color: #0f5132;
      }

      &.error {
        background: #f8d7da;
        color: #842029;
      }
    }
  }
}

.progress-bar {
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;

  .progress {
    height: 100%;
    background: #42b883;
    transition: width 0.3s ease;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-button {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &.remove {
    background: #f8d7da;
    color: #842029;

    &:hover {
      background: #f5c2c7;
    }
  }

  &.download {
    background: #d1e7dd;
    color: #0f5132;

    &:hover {
      background: #badbcc;
    }
  }
}

.queue-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.875rem;

  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    color: #666;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style> 