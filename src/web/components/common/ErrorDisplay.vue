<template>
  <div v-if="errors.length > 0" class="error-display">
    <div class="error-header">
      <h3>{{ errors.length === 1 ? 'Error' : `${errors.length} Errors` }}</h3>
      <button @click="clearAllErrors" class="clear-btn">Clear All</button>
    </div>

    <div class="error-list">
      <div 
        v-for="error in errors" 
        :key="error.timestamp.getTime()"
        class="error-item"
        :class="error.type.toLowerCase()"
      >
        <div class="error-icon">
          {{ getErrorIcon(error.type) }}
        </div>
        
        <div class="error-content">
          <div class="error-message">{{ error.userMessage }}</div>
          
          <div v-if="showDetails" class="error-details">
            <div class="error-meta">
              <span class="error-type">{{ error.type }}</span>
              <span class="error-time">{{ formatTime(error.timestamp) }}</span>
            </div>
            <div v-if="error.details" class="error-stack">{{ error.details }}</div>
          </div>
        </div>

        <div class="error-actions">
          <button 
            v-if="error.retryable"
            @click="$emit('retry', error)"
            class="action-btn retry"
            title="Retry operation"
          >
            🔄
          </button>
          
          <button 
            @click="toggleDetails"
            class="action-btn details"
            :title="showDetails ? 'Hide details' : 'Show details'"
          >
            {{ showDetails ? '🔼' : '🔽' }}
          </button>
          
          <button 
            @click="dismissError(error)"
            class="action-btn dismiss"
            title="Dismiss error"
          >
            ❌
          </button>
        </div>
      </div>
    </div>

    <div v-if="hasRecoverableErrors" class="error-suggestions">
      <h4>💡 Suggestions:</h4>
      <ul>
        <li v-if="hasMemoryErrors">Close other browser tabs to free up memory</li>
        <li v-if="hasFormatErrors">Check that your files are in supported formats</li>
        <li v-if="hasSizeErrors">Try compressing large files before conversion</li>
        <li v-if="hasNetworkErrors">Check your internet connection</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ErrorHandler, ErrorType, type AppError } from '@shared/utils/errorHandler'

defineEmits<{
  (e: 'retry', error: AppError): void
}>()

const showDetails = ref(false)
const errors = computed(() => ErrorHandler.getErrors())

const hasRecoverableErrors = computed(() => 
  errors.value.some(error => error.recoverable)
)

const hasMemoryErrors = computed(() => 
  errors.value.some(error => error.type === ErrorType.MEMORY_ERROR)
)

const hasFormatErrors = computed(() => 
  errors.value.some(error => error.type === ErrorType.INVALID_FORMAT)
)

const hasSizeErrors = computed(() => 
  errors.value.some(error => error.type === ErrorType.FILE_TOO_LARGE)
)

const hasNetworkErrors = computed(() => 
  errors.value.some(error => error.type === ErrorType.NETWORK_ERROR)
)

function getErrorIcon(type: ErrorType): string {
  switch (type) {
    case ErrorType.FILE_TOO_LARGE: return '📏'
    case ErrorType.INVALID_FORMAT: return '📄'
    case ErrorType.CONVERSION_FAILED: return '⚠️'
    case ErrorType.MEMORY_ERROR: return '🧠'
    case ErrorType.NETWORK_ERROR: return '🌐'
    case ErrorType.BROWSER_NOT_SUPPORTED: return '🌍'
    case ErrorType.WORKER_ERROR: return '⚙️'
    default: return '❗'
  }
}

function formatTime(timestamp: Date): string {
  return timestamp.toLocaleTimeString()
}

function toggleDetails() {
  showDetails.value = !showDetails.value
}

function dismissError(error: AppError) {
  const index = ErrorHandler.getErrors().indexOf(error)
  if (index > -1) {
    ErrorHandler.getErrors().splice(index, 1)
  }
}

function clearAllErrors() {
  ErrorHandler.clearErrors()
}
</script>

<style lang="scss" scoped>
.error-display {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  margin: 1rem 0;
  overflow: hidden;
}

.error-header {
  background: #feb2b2;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    color: #742a2a;
    font-size: 1rem;
  }
}

.clear-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    background: #c53030;
  }
}

.error-list {
  max-height: 300px;
  overflow-y: auto;
}

.error-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #fed7d7;

  &:last-child {
    border-bottom: none;
  }
}

.error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
  min-width: 0;
}

.error-message {
  color: #742a2a;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.error-details {
  font-size: 0.875rem;
  color: #a0aec0;
}

.error-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.error-type {
  background: #e2e8f0;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.error-stack {
  background: #f7fafc;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.75rem;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.action-btn {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;

  &:hover {
    background: #f7fafc;
  }

  &.retry {
    border-color: #38b2ac;
    &:hover { background: #e6fffa; }
  }

  &.dismiss {
    border-color: #e53e3e;
    &:hover { background: #fff5f5; }
  }
}

.error-suggestions {
  background: #edf2f7;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;

  h4 {
    margin: 0 0 0.5rem;
    color: #2d3748;
    font-size: 0.875rem;
  }

  ul {
    margin: 0;
    padding-left: 1.25rem;
    color: #4a5568;
    font-size: 0.875rem;

    li {
      margin-bottom: 0.25rem;
    }
  }
}
</style>