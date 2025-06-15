import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const isProcessing = ref(false)
  const currentFile = ref<File | null>(null)
  const error = ref<string | null>(null)
  const darkMode = ref(false)

  // Actions
  function setProcessing(status: boolean) {
    isProcessing.value = status
  }

  function setCurrentFile(file: File | null) {
    currentFile.value = file
  }

  function setError(message: string | null) {
    error.value = message
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
  }

  function reset() {
    isProcessing.value = false
    currentFile.value = null
    error.value = null
  }

  return {
    // State
    isProcessing,
    currentFile,
    error,
    darkMode,

    // Actions
    setProcessing,
    setCurrentFile,
    setError,
    toggleDarkMode,
    reset
  }
}) 