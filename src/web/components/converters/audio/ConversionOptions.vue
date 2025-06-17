<template>
  <div class="conversion-options">
    <h2>Conversion Options</h2>
    
    <div class="options-grid">
      <div class="option-card">
        <h3>Convert to MP3</h3>
        <p>Convert audio to MP3 format</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <label>Quality:</label>
            <select v-model="audioStore.audioQuality" :disabled="isProcessing">
              <option :value="0">Maximum (0)</option>
              <option :value="2">High (2)</option>
              <option :value="4">Medium (4)</option>
              <option :value="6">Low (6)</option>
            </select>
            <span class="quality-hint">Lower number = better quality</span>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('convert', 'mp3')"
        >
          {{ isProcessing ? 'Converting...' : 'Convert to MP3' }}
        </button>
      </div>

      <div class="option-card">
        <h3>Convert to WAV</h3>
        <p>Convert audio to WAV format (uncompressed)</p>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('convert', 'wav')"
        >
          {{ isProcessing ? 'Converting...' : 'Convert to WAV' }}
        </button>
      </div>

      <div class="option-card">
        <h3>Convert to OGG</h3>
        <p>Convert audio to OGG format</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <label>Quality:</label>
            <select v-model="audioStore.audioQuality" :disabled="isProcessing">
              <option :value="0">Maximum (0)</option>
              <option :value="2">High (2)</option>
              <option :value="4">Medium (4)</option>
              <option :value="6">Low (6)</option>
            </select>
            <span class="quality-hint">Lower number = better quality</span>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('convert', 'ogg')"
        >
          {{ isProcessing ? 'Converting...' : 'Convert to OGG' }}
        </button>
      </div>

      <div class="option-card">
        <h3>Compress Audio</h3>
        <p>Reduce audio file size</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <span class="quality-hint">Compresses to MP3 with reduced quality</span>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('compress')"
        >
          {{ isProcessing ? 'Compressing...' : 'Compress Audio' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAudioStore } from '@web/stores/converters/audio'

defineProps<{
  files: File[]
  isProcessing: boolean
}>()

defineEmits<{
  (e: 'convert', format: 'mp3' | 'wav' | 'ogg'): void
  (e: 'compress'): void
}>()

const audioStore = useAudioStore()
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
  flex-direction: column;
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

  .quality-hint {
    color: #666;
    font-size: 0.75rem;
    font-style: italic;
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