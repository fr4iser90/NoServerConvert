<template>
  <div class="conversion-options">
    <h2>Conversion Options</h2>
    
    <!-- Convert to Image -->
    <div class="option-section">
      <h3>Convert to Image</h3>
      <p>Converts AI files to image formats</p>
      
      <!-- Format Selection -->
      <div class="format-group">
        <label>Output Format:</label>
        <select v-model="selectedFormat" :disabled="isProcessing">
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="webp">WebP</option>
        </select>
      </div>
      
      <!-- Quality Settings (for JPG/WebP) -->
      <div v-if="selectedFormat !== 'png'" class="quality-group">
        <label>Quality: {{ quality }}%</label>
        <input
          type="range"
          min="10"
          max="100"
          v-model="quality"
          :disabled="isProcessing"
        />
      </div>
      
      <button
        class="convert-button"
        :disabled="!files.length || isProcessing"
        @click="$emit('convert', 'image', { format: selectedFormat, quality })"
      >
        {{ isProcessing ? 'Converting...' : 'Convert to Image' }}
      </button>
    </div>
    
    <!-- Convert to SVG -->
    <div class="option-section">
      <h3>Convert to SVG</h3>
      <p>Converts AI files to SVG format</p>
      
      <button
        class="convert-button"
        :disabled="!files.length || isProcessing"
        @click="$emit('convert', 'svg')"
      >
        {{ isProcessing ? 'Converting...' : 'Convert to SVG' }}
      </button>
    </div>
    
    <!-- Convert to PDF -->
    <div class="option-section">
      <h3>Convert to PDF</h3>
      <p>Converts AI files to PDF format</p>
      
      <button
        class="convert-button"
        :disabled="!files.length || isProcessing"
        @click="$emit('convert', 'pdf')"
      >
        {{ isProcessing ? 'Converting...' : 'Convert to PDF' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAiStore } from '@web/stores/converters/ai'

defineProps<{
  files: File[]
  isProcessing: boolean
}>()

defineEmits<{
  (e: 'convert', format: 'image' | 'svg' | 'pdf', options?: { format: string, quality: number }): void
}>()

const aiStore = useAiStore()

// Reactive variables for the form
const selectedFormat = ref('png')
const quality = ref(90)
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
  }
}
</style> 