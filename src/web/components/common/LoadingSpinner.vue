<template>
  <div class="loading-spinner" :class="{ 'overlay': overlay, 'inline': !overlay }">
    <div v-if="overlay" class="loading-backdrop"></div>
    
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
        
        <!-- File Counter -->
        <div v-if="fileCount && fileCount > 1" class="file-counter">
          File {{ currentFile }} of {{ fileCount }}
        </div>
        
        <!-- Progress Bar -->
        <div v-if="progress !== undefined" class="progress-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${Math.max(0, Math.min(100, progress))}%` }"
            ></div>
          </div>
          <div class="progress-text">{{ Math.round(progress) }}%</div>
        </div>
        
        <!-- Cancel Button -->
        <button 
          v-if="cancellable" 
          @click="$emit('cancel')" 
          class="cancel-button"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  overlay?: boolean
  size?: 'small' | 'medium' | 'large'
  title?: string
  message: string
  progress?: number
  fileCount?: number
  currentFile?: number
  cancellable?: boolean
}>()

defineEmits<{
  cancel: []
}>()
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
    margin: 0 0 1rem;
    color: #4a5568;
    font-size: 1rem;
  }
}

.file-counter {
  margin: 0.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.progress-container {
  margin: 1rem 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #369870);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 600;
}

.cancel-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #dc2626;
  }

  &:active {
    background-color: #b91c1c;
  }
}
</style>