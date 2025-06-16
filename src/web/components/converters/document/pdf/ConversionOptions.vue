<template>
  <div class="conversion-options">
    <h2>Conversion Options</h2>
    
    <div class="options-grid">
      <div class="option-card">
        <h3>PDF to Image</h3>
        <p>Convert PDF pages to images</p>
        <div class="conversion-settings">
          <div class="setting-group">
            <label>
              <input type="checkbox" v-model="pdfStore.useZip" />
              Package all images in ZIP
            </label>
          </div>
          <div class="setting-group">
            <label>Image Format:</label>
            <select v-model="pdfStore.imageFormat">
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length"
          @click="$emit('convert', 'image')"
        >
          Convert to Images
        </button>
      </div>

      <div class="option-card">
        <h3>PDF to Text</h3>
        <p>Extract text from PDFs</p>
        <button
          class="convert-button"
          :disabled="!files.length"
          @click="$emit('convert', 'text')"
        >
          Extract Text
        </button>
      </div>

      <div class="option-card">
        <h3>PDF to HTML</h3>
        <p>Convert PDFs to HTML format</p>
        <button
          class="convert-button"
          :disabled="!files.length"
          @click="$emit('convert', 'html')"
        >
          Convert to HTML
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePdfStore } from '@web/stores/converters/pdf'

defineProps<{
  files: File[]
}>()

defineEmits<{
  (e: 'convert', type: 'image' | 'text' | 'html'): void
}>()

const pdfStore = usePdfStore()
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