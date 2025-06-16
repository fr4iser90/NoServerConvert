<template>
  <div class="conversion-options">
    <h2>Konvertierungsoptionen</h2>
    
    <div class="options-grid">
      <div class="option-card">
        <h3>AI zu Bild</h3>
        <p>Konvertiert AI-Dateien in Bildformate</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <label>Bildformat:</label>
            <select v-model="aiStore.imageFormat">
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          <div class="setting-group">
            <label>Qualität:</label>
            <select v-model="aiStore.imageQuality">
              <option value="0.9">Hoch (90%)</option>
              <option value="0.8">Mittel (80%)</option>
              <option value="0.7">Niedrig (70%)</option>
            </select>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('convert', 'image')"
        >
          Zu Bild konvertieren
        </button>
      </div>

      <div class="option-card">
        <h3>AI zu SVG</h3>
        <p>Konvertiert AI-Dateien in SVG-Format</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <label>
              <input type="checkbox" v-model="aiStore.optimizeSvg" />
              SVG optimieren
            </label>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('convert', 'svg')"
        >
          Zu SVG konvertieren
        </button>
      </div>

      <div class="option-card">
        <h3>AI zu PDF</h3>
        <p>Konvertiert AI-Dateien in PDF-Format</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <label>
              <input type="checkbox" v-model="aiStore.compressPdf" />
              PDF komprimieren
            </label>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || isProcessing"
          @click="$emit('convert', 'pdf')"
        >
          Zu PDF konvertieren
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAiStore } from '@web/stores/converters/ai'

defineProps<{
  files: File[]
  isProcessing: boolean
}>()

defineEmits<{
  (e: 'convert', format: 'image' | 'svg' | 'pdf'): void
}>()

const aiStore = useAiStore()
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