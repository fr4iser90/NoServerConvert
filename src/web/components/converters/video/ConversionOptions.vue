<template>
  <div class="conversion-options">
    <h2>Conversion Options</h2>
    
    <div class="options-grid">
      <div class="option-card">
        <h3>Convert to MP4</h3>
        <p>Convert video to MP4 format (H.264)</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <label>Quality (CRF):</label>
            <select v-model="videoStore.videoQuality" :disabled="isProcessing">
              <option :value="18">Maximum (18)</option>
              <option :value="23">High (23)</option>
              <option :value="28">Medium (28)</option>
              <option :value="35">Low (35)</option>
            </select>
            <span class="quality-hint">Lower number = better quality (0-51)</span>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('convert', 'mp4')"
        >
          {{ isProcessing ? 'Converting...' : 'Convert to MP4' }}
        </button>
      </div>

      <div class="option-card">
        <h3>Convert to WebM</h3>
        <p>Convert video to WebM format (VP9)</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <label>Quality (CRF):</label>
            <select v-model="videoStore.videoQuality" :disabled="isProcessing">
              <option :value="18">Maximum (18)</option>
              <option :value="23">High (23)</option>
              <option :value="28">Medium (28)</option>
              <option :value="35">Low (35)</option>
            </select>
            <span class="quality-hint">Lower number = better quality (0-51)</span>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('convert', 'webm')"
        >
          {{ isProcessing ? 'Converting...' : 'Convert to WebM' }}
        </button>
      </div>

      <div class="option-card">
        <h3>Extract Audio</h3>
        <p>Extract audio from video</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <span class="quality-hint">Extracts audio as high-quality MP3</span>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('extract-audio')"
        >
          {{ isProcessing ? 'Extracting...' : 'Extract Audio' }}
        </button>
      </div>

      <div class="option-card">
        <h3>Compress Video</h3>
        <p>Reduce video file size</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <span class="quality-hint">Compresses to MP4 with reduced quality and bitrate</span>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('compress')"
        >
          {{ isProcessing ? 'Compressing...' : 'Compress Video' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVideoStore } from '@web/stores/converters/video'

defineProps<{
  files: File[]
  isProcessing: boolean
}>()

defineEmits<{
  (e: 'convert', format: 'mp4' | 'webm'): void
  (e: 'extract-audio'): void
  (e: 'compress'): void
}>()

const videoStore = useVideoStore()
</script>

<style lang="scss" scoped>
.conversion-options {
  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #2c3e50;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }
  }
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.75rem;
  }
}

.option-card {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    
    @media (max-width: 480px) {
      font-size: 1.125rem;
      margin-bottom: 0.375rem;
    }
  }

  p {
    color: #666;
    margin: 0 0 1rem;
    font-size: 0.875rem;
    
    @media (max-width: 480px) {
      font-size: 0.8125rem;
      margin-bottom: 0.75rem;
      line-height: 1.4;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 6px;
  }
}

.conversion-settings {
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  
  @media (max-width: 480px) {
    margin: 0.75rem 0;
    padding: 0.75rem 0;
  }
}

.setting-group {
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    color: #666;
    font-size: 0.875rem;
    
    @media (max-width: 480px) {
      font-size: 0.8125rem;
    }
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
    
    @media (max-width: 480px) {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      border-radius: 6px;
    }
  }

  .quality-hint {
    color: #666;
    font-size: 0.75rem;
    font-style: italic;
    
    @media (max-width: 480px) {
      font-size: 0.6875rem;
      line-height: 1.3;
    }
  }
  
  @media (max-width: 480px) {
    gap: 0.375rem;
    margin-bottom: 0.375rem;
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
  
  @media (max-width: 480px) {
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
    border-radius: 6px;
    font-weight: 600;
  }
}
</style>