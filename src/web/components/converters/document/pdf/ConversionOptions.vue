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
              <input type="checkbox" v-model="pdfStore.useZip" :disabled="disabled" />
              Package all images in ZIP
            </label>
          </div>
          <div class="setting-group">
            <label>Image Format:</label>
            <select v-model="pdfStore.imageFormat" :disabled="disabled">
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>
          </div>
        </div>
        <button
          class="convert-button"
          :disabled="!files.length || disabled"
          @click="$emit('convert', 'image')"
        >
          {{ disabled ? 'Converting...' : 'Convert to Images' }}
        </button>
      </div>

      <div class="option-card">
        <h3>PDF to Text</h3>
        <p>Extract text from PDFs</p>
        <button
          class="convert-button"
          :disabled="!files.length || disabled"
          @click="$emit('convert', 'text')"
        >
          {{ disabled ? 'Extracting...' : 'Extract Text' }}
        </button>
      </div>

      <div class="option-card">
        <h3>PDF to HTML</h3>
        <p>Convert PDFs to HTML format</p>
        <button
          class="convert-button"
          :disabled="!files.length || disabled"
          @click="$emit('convert', 'html')"
        >
          {{ disabled ? 'Converting...' : 'Convert to HTML' }}
        </button>
      </div>

      <div class="option-card">
        <h3>Compress PDF</h3>
        <p>Reduce file size by rebuilding pages as optimized images.</p>
        <div class="conversion-settings">
          <div class="setting-group setting-group--stacked">
            <label>Compression Level:</label>
            <select v-model="pdfStore.compressionPreset" :disabled="disabled">
              <option
                v-for="(preset, key) in PDF_COMPRESSION_PRESETS"
                :key="key"
                :value="key"
              >
                {{ preset.label }}
              </option>
            </select>
            <span class="setting-hint">
              {{ PDF_COMPRESSION_PRESETS[pdfStore.compressionPreset].description }}
            </span>
          </div>
          <div class="setting-group setting-group--stacked">
            <label>
              <input
                type="checkbox"
                v-model="pdfStore.useTargetSize"
                :disabled="disabled"
              />
              Try to reach target size
            </label>
            <div class="inline-input">
              <input
                type="number"
                min="1"
                step="0.1"
                v-model.number="pdfStore.targetSizeMb"
                :disabled="disabled || !pdfStore.useTargetSize"
              />
              <span>MB</span>
            </div>
            <span class="setting-hint">
              Adds stronger fallback attempts until the target is reached. If the target is impossible, no file is downloaded.
            </span>
          </div>
          <div class="setting-group setting-group--stacked">
            <label>Pages to compress (optional):</label>
            <input
              type="text"
              v-model="pdfStore.pageSelection"
              placeholder="All pages, or e.g. 1,3-5"
              :disabled="disabled"
            />
            <span class="setting-hint">
              Leave empty to compress all pages. Use this for image-heavy pages while preserving text pages.
            </span>
          </div>
          <div class="setting-group setting-group--stacked">
            <label>
              <input
                type="checkbox"
                v-model="pdfStore.useQpdfOptimization"
                :disabled="disabled"
              />
              Advanced qPDF optimization (experimental)
            </label>
            <span class="setting-hint">
              Loads qPDF WASM only when compressing. This can improve PDF structure/stream compression, but adds a larger one-time download and uses more CPU/RAM.
            </span>
          </div>
        </div>
        <p class="warning-text">
          Best for scanned PDFs. Compressed pages lose text selection, links and forms. Unselected pages are copied from the original where possible.
        </p>
        <button
          class="convert-button"
          :disabled="!files.length || disabled"
          @click="$emit('convert', 'compress')"
        >
          {{ disabled ? 'Compressing...' : 'Compress PDF' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PDF_COMPRESSION_PRESETS, usePdfStore } from '@web/stores/converters/pdf'

defineProps<{
  files: File[]
  useZip?: boolean
  imageFormat?: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'convert', type: 'image' | 'text' | 'html' | 'compress'): void
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

  select,
  input[type="number"],
  input[type="text"] {
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

  input[type="checkbox"] {
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &--stacked {
    align-items: stretch;
    flex-direction: column;
  }
}

.inline-input {
  align-items: center;
  display: flex;
  gap: 0.5rem;

  input {
    width: 6rem;
  }

  span {
    color: #64748b;
    font-size: 0.875rem;
  }
}

.setting-hint,
.warning-text {
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.4;
}

.warning-text {
  margin-top: 0;
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