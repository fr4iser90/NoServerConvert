<template>
  <div v-if="files.length > 0" class="file-list">
    <h3>{{ title }}</h3>
    <ul>
      <li v-for="file in files" :key="file.name" class="file-item">
        <span class="file-name">{{ file.name }}</span>
        <span class="file-size">({{ formatFileSize(file.size) }})</span>
        <button 
          class="remove-file" 
          @click="$emit('remove', file)"
          title="Datei entfernen"
        >
          ×
        </button>
      </li>
    </ul>
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
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;

  h3 {
    font-size: 1rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .file-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .file-name {
    flex: 1;
    font-size: 0.875rem;
    color: #2c3e50;
    word-break: break-all;
  }

  .file-size {
    font-size: 0.75rem;
    color: #666;
    margin: 0 0.5rem;
  }

  .remove-file {
    background: none;
    border: none;
    color: #dc3545;
    font-size: 1.25rem;
    padding: 0 0.5rem;
    cursor: pointer;
    line-height: 1;
    
    &:hover {
      color: #c82333;
    }
  }
}
</style> 