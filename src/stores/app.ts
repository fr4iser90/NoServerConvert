import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const isProcessing = ref(false)
  const currentFiles = ref<File[]>([])
  const error = ref<string | null>(null)
  const darkMode = ref(false)

  // Actions
  function setProcessing(status: boolean) {
    isProcessing.value = status
  }

  function setCurrentFiles(files: File[]) {
    console.log('[Store] Setting current files:', files.length, 'files')
    console.log('[Store] Files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))
    currentFiles.value = files
    console.log('[Store] Current files after update:', currentFiles.value.length, 'files')
  }

  function setError(message: string | null) {
    error.value = message
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
  }

  function reset() {
    isProcessing.value = false
    currentFiles.value = []
    error.value = null
  }

  return {
    // State
    isProcessing,
    currentFiles,
    error,
    darkMode,

    // Actions
    setProcessing,
    setCurrentFiles,
    setError,
    toggleDarkMode,
    reset
  }
}) 