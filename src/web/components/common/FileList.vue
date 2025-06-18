<template>
  <div v-if="files.length > 0" class="file-list">
    <h2>{{ title }}</h2>
    <div class="files-container">
      <div v-for="file in files" :key="file.name" class="file-item">
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div class="file-size">({{ formatFileSize(file.size) }})</div>
        </div>
        <button 
          class="remove-btn" 
          @click="$emit('remove', file)"
          title="Datei entfernen"
        >
          Entfernen
        </button>
      </div>
    </div>
  </div>
  <div v-else class="empty-state">
    Keine Dateien vorhanden
  </div>
</template>

<script setup lang="ts">
defineProps<{
  files: File[]
  title?: string
}>()

defineEmits<{
  (e: 'remove', file: File): void
}>()

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style lang="scss" scoped>
.file-list {
  margin-top: 2rem;

  @media (max-width: 640px) {
    margin-top: 1.5rem;
  }

  h2 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.25rem;

    @media (max-width: 640px) {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }
  }
}

.files-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8f9fa;

  @media (max-width: 640px) {
    max-height: 250px;
    gap: 0.5rem;
    padding: 0.375rem;
    border-radius: 6px;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  @media (max-width: 640px) {
    padding: 0.5rem;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  &:hover {
    border-color: #cbd5e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}

.file-info {
  flex: 1;
  min-width: 0;

  .file-name {
    font-weight: 500;
    color: #2d3748;
    font-size: 0.875rem;
    word-break: break-all;
    line-height: 1.3;
    margin-bottom: 0.25rem;

    @media (max-width: 640px) {
      font-size: 0.8rem;
    }
  }

  .file-size {
    font-size: 0.75rem;
    color: #718096;

    @media (max-width: 640px) {
      font-size: 0.7rem;
    }
  }
}

.remove-btn {
  padding: 0.375rem 0.75rem;
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #feb2b2;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  @media (max-width: 640px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }

  &:hover {
    background: #feb2b2;
    border-color: #fc8181;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;

  @media (max-width: 640px) {
    padding: 1.5rem;
    font-size: 0.875rem;
  }
}
</style> 