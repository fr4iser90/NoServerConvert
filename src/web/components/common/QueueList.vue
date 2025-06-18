<template>
  <div class="queue-list">
    <div class="queue-header">
      <h2>{{ converterName }} Queue</h2>
      <div class="queue-stats">
        <span class="stat">{{ filteredFiles.length }} files</span>
        <span class="stat">{{ converterProgress }}% complete</span>
      </div>
    </div>

    <!-- 🎯 BULK DOWNLOAD CONTROLS - NO MANUAL DOWNLOAD BUTTON! -->
    <div class="bulk-controls">
      <div class="bulk-mode">
        <label>Download Mode:</label>
        <select 
          :value="queueStore.bulkDownloadMode" 
          @change="queueStore.setBulkDownloadMode(($event.target as HTMLSelectElement).value as 'pack10' | 'all')"
          class="mode-select"
        >
          <option value="pack10">📦 10er-Pakete (auto)</option>
          <option value="all">📋 Alle zusammen (am Ende)</option>
        </select>
      </div>
    </div>

    <div class="queue-controls">
      <button 
        v-if="queueStore.isProcessing && hasPendingFiles"
        @click="queueStore.pauseProcessing()"
        class="control-btn pause"
      >
        ⏸️ Pause
      </button>
      <button 
        v-else-if="hasPendingFiles"
        @click="queueStore.startProcessing()"
        class="control-btn play"
      >
        ▶️ Start {{ pendingCount }} Files
      </button>
      
      <button 
        v-if="completedCount > 0"
        @click="clearCompletedForConverter()"
        class="control-btn clear"
      >
        🗑️ Clear {{ completedCount }} Completed
      </button>
      
      <button 
        v-if="errorCount > 0"
        @click="clearErrorsForConverter()"
        class="control-btn clear"
      >
        ❌ Clear {{ errorCount }} Errors
      </button>
      
      <button 
        v-if="filteredFiles.length > 0"
        @click="clearAllForConverter()"
        class="control-btn clear-all"
      >
        🗑️ Clear All {{ converterName }}
      </button>
    </div>

    <div class="queue-items" v-if="filteredFiles.length > 0">
      <div 
        v-for="file in filteredFiles" 
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
            <!-- 🎯 AUTO-DOWNLOAD STATUS -->
            <span v-if="file.status === 'completed'" class="download-badge">
              📥 Auto-Downloaded
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
            @change="queueStore.setPriority(file.id, Number(($event.target as HTMLSelectElement).value))"
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
      <p>No {{ converterName.toLowerCase() }} files in queue</p>
      <p class="hint">Upload {{ converterName.toLowerCase() }} files to start converting</p>
    </div>

    <!-- 🎯 BULK DOWNLOAD INFO -->
    <div v-if="filteredFiles.length > 0" class="bulk-info">
      <div class="info-item">
        <strong>Download Mode:</strong> 
        {{ queueStore.bulkDownloadMode === 'pack10' ? '📦 10er-Pakete (automatisch)' : '📋 Alle am Ende' }}
      </div>
      <div v-if="queueStore.bulkDownloadMode === 'pack10'" class="info-item">
        💡 Alle 10 fertigen Dateien wird automatisch ein ZIP-Paket heruntergeladen
      </div>
      <div v-else class="info-item">
        💡 Alle Dateien werden am Ende als ein großes ZIP heruntergeladen
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQueueStore, type QueuedFile } from '@web/stores/queue'

const queueStore = useQueueStore()
const route = useRoute()

// 🎯 CONVERTER-SPECIFIC FILTERING
const currentConverter = computed(() => {
  const path = route.path
  if (path.includes('/pdf')) return 'pdf'
  if (path.includes('/audio')) return 'audio'
  if (path.includes('/video')) return 'video'
  if (path.includes('/image')) return 'image'
  return 'all'
})

const converterName = computed(() => {
  switch (currentConverter.value) {
    case 'pdf': return 'PDF'
    case 'audio': return 'Audio'
    case 'video': return 'Video'
    case 'image': return 'Image'
    default: return 'All'
  }
})

// 🎯 FILTERED FILES BY CURRENT CONVERTER
const filteredFiles = computed(() => {
  if (currentConverter.value === 'all') return queueStore.files
  return queueStore.files.filter(f => f.converter === currentConverter.value)
})

// 🎯 CONVERTER-SPECIFIC STATS
const pendingCount = computed(() => 
  filteredFiles.value.filter(f => f.status === 'pending').length
)

const completedCount = computed(() => 
  filteredFiles.value.filter(f => f.status === 'completed').length
)

const errorCount = computed(() => 
  filteredFiles.value.filter(f => f.status === 'error').length
)

const hasPendingFiles = computed(() => pendingCount.value > 0)

const converterProgress = computed(() => {
  if (filteredFiles.value.length === 0) return 0
  const total = filteredFiles.value.reduce((sum, file) => sum + file.progress, 0)
  return Math.round(total / filteredFiles.value.length)
})

// 🎯 CONVERTER-SPECIFIC CLEARING FUNCTIONS
function clearCompletedForConverter() {
  const completedIds = filteredFiles.value
    .filter(f => f.status === 'completed')
    .map(f => f.id)
  
  completedIds.forEach(id => queueStore.removeFile(id))
  console.log(`[QueueList] 🗑️ Cleared ${completedIds.length} completed ${converterName.value} files`)
}

function clearErrorsForConverter() {
  const errorIds = filteredFiles.value
    .filter(f => f.status === 'error')
    .map(f => f.id)
  
  errorIds.forEach(id => queueStore.removeFile(id))
  console.log(`[QueueList] 🗑️ Cleared ${errorIds.length} error ${converterName.value} files`)
}

function clearAllForConverter() {
  const allIds = filteredFiles.value.map(f => f.id)
  allIds.forEach(id => queueStore.removeFile(id))
  console.log(`[QueueList] 🗑️ Cleared all ${allIds.length} ${converterName.value} files`)
}

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

/* 🎯 BULK CONTROLS STYLING - NO MANUAL DOWNLOAD! */
.bulk-controls {
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bulk-mode {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;

  label {
    color: #2c3e50;
    font-weight: 500;
  }
}

.mode-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  color: #2c3e50;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #42b883;
    box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
  }
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

  &.clear-all {
    background: #dc3545;
    color: white;
    &:hover:not(:disabled) { 
      background: #c82333; 
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
  flex-wrap: wrap;
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

/* 🎯 AUTO-DOWNLOAD BADGE */
.download-badge {
  background: #42b883;
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-size: 0.625rem;
  font-weight: 500;
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
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.75rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #42b883;
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

/* 🎯 BULK DOWNLOAD INFO */
.bulk-info {
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  font-size: 0.875rem;
}

.info-item {
  margin-bottom: 0.5rem;
  color: #2c3e50;

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: #2c3e50;
  }
}
</style>