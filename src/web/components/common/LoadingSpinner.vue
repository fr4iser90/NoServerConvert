<template>
  <div class="loading-spinner" :class="{ 'overlay': overlay, 'inline': !overlay }">
    <div v-if="overlay" class="loading-backdrop" @click="handleBackdropClick"></div>
    
    <div class="loading-content">
      <div class="spinner" :class="size">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      
      <div class="loading-text">
        <h3 v-if="title">{{ title }}</h3>
        <p>{{ message }}</p>
        <p v-if="subMessage" class="sub-message">{{ subMessage }}</p>
        
        <!-- Progress bar if progress is provided -->
        <div v-if="progress !== undefined" class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <span class="progress-text">{{ progress }}%</span>
        </div>
        
        <!-- File counter if provided -->
        <div v-if="fileCount" class="file-counter">
          {{ currentFile }} / {{ fileCount }} files
        </div>
      </div>
      
      <button 
        v-if="cancellable && overlay" 
        @click="$emit('cancel')"
        class="cancel-button"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  overlay?: boolean
  size?: 'small' | 'medium' | 'large'
  title?: string
  message: string
  subMessage?: string
  progress?: number
  fileCount?: number
  currentFile?: number
  cancellable?: boolean
}>()

defineEmits<{
  (e: 'cancel'): void
}>()

function handleBackdropClick() {
  // Prevent closing on backdrop click for now
  // Could be made configurable if needed
}
</script>

<style lang="scss" scoped>
.loading-spinner {
  &.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &.inline {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(2px);
}

.loading-content {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  text-align: center;
  max-width: 400px;
  margin: 0 1rem;
}

.spinner {
  position: relative;
  margin: 0 auto 1.5rem;
  
  &.small {
    width: 40px;
    height: 40px;
  }
  
  &.medium {
    width: 60px;
    height: 60px;
  }
  
  &.large {
    width: 80px;
    height: 80px;
  }
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;

  &:nth-child(1) {
    border-top-color: #42b883;
    animation-delay: 0s;
  }

  &:nth-child(2) {
    border-right-color: #42b883;
    animation-delay: 0.1s;
  }

  &:nth-child(3) {
    border-bottom-color: #42b883;
    animation-delay: 0.2s;
  }

  &:nth-child(4) {
    border-left-color: #42b883;
    animation-delay: 0.3s;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: rotate(180deg);
    opacity: 0.7;
  }
  100% {
    transform: rotate(360deg);
    opacity: 1;
  }
}

.loading-text {
  h3 {
    margin: 0 0 0.5rem;
    color: #2c3e50;
    font-size: 1.25rem;
    font-weight: 600;
  }

  p {
    margin: 0 0 0.5rem;
    color: #4a5568;
    font-size: 1rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .sub-message {
    font-size: 0.875rem;
    color: #718096;
    font-style: italic;
  }
}

.progress-container {
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #3aa876);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
  min-width: 40px;
}

.file-counter {
  background: #f7fafc;
  color: #4a5568;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
}

.cancel-button {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #cbd5e0;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>