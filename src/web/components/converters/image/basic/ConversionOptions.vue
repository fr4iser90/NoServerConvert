<template>
  <div class="conversion-options">
    <h2>Conversion Options</h2>
    
    <div class="options-grid">
      <div class="option-card">
        <h3>Convert to JPG</h3>
        <p>Convert images to JPG format</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <label>Quality:</label>
            <select v-model="imageStore.imageQuality" :disabled="isProcessing">
              <option :value="1.0">Maximum (100%)</option>
              <option :value="0.9">High (90%)</option>
              <option :value="0.8">Medium (80%)</option>
              <option :value="0.7">Low (70%)</option>
            </select>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('convert', 'jpg')"
        >
          {{ isProcessing ? 'Converting...' : 'Convert to JPG' }}
        </button>
      </div>

      <div class="option-card">
        <h3>Convert to PNG</h3>
        <p>Convert images to PNG format</p>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('convert', 'png')"
        >
          {{ isProcessing ? 'Converting...' : 'Convert to PNG' }}
        </button>
      </div>

      <div class="option-card">
        <h3>Convert to WebP</h3>
        <p>Convert images to WebP format</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <label>Quality:</label>
            <select v-model="imageStore.imageQuality" :disabled="isProcessing">
              <option :value="1.0">Maximum (100%)</option>
              <option :value="0.9">High (90%)</option>
              <option :value="0.8">Medium (80%)</option>
              <option :value="0.7">Low (70%)</option>
            </select>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('convert', 'webp')"
        >
          {{ isProcessing ? 'Converting...' : 'Convert to WebP' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useImageStore } from '@web/stores/converters/image'

defineProps<{
  files: File[]
  isProcessing: boolean
}>()

defineEmits<{
  (e: 'convert', format: 'jpg' | 'png' | 'webp'): void
}>()

const imageStore = useImageStore()
</script>

<style lang="scss" scoped>
.conversion-options {
  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #2c3e50;
  }
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.option-card {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    margin: 0 0 1rem;
    font-size: 0.875rem;
  }
}

.conversion-settings {
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid #eee;
}

.setting-group {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    color: #666;
    font-size: 0.875rem;
  }

  select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    color: #2c3e50;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

.convert-button {
  width: 100%;
  padding: 0.75rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;

  &:hover:not(:disabled) {
    background: #3aa876;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: #94a3b8;
  }
}
</style>