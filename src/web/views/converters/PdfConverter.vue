<template>
  <div class="pdf-converter">
    <h1>PDF Converter</h1>
    
    <div class="converter-content">
      <FileUpload
        accept=".pdf"
        hint="Maximal 10 Dateien, je 100MB"
        :max-size="100 * 1024 * 1024"
        :multiple="true"
        :max-files="10"
        @file-selected="handleFilesSelected"
        @error="handleError"
      />

      <div v-if="appStore.currentFiles.length > 0" class="conversion-options">
        <h2>Conversion Options</h2>
        
        <div class="options-grid">
          <div class="option-card">
            <h3>PDF to Image</h3>
            <p>Convert PDF pages to images</p>
            <div class="conversion-settings">
              <div class="setting-group">
                <label>
                  <input type="checkbox" v-model="useZip" />
                  Alle Bilder in ZIP
                </label>
              </div>
              <div class="setting-group">
                <label>Bildformat:</label>
                <select v-model="imageFormat">
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>
              </div>
            </div>
            <button
              class="convert-button"
              :disabled="appStore.isProcessing"
              @click="convertAllToImage"
            >
              Alle konvertieren
            </button>
          </div>

          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="convertAllToText"
          >
            <h3>PDF to Text</h3>
            <p>Extract text from PDFs</p>
          </button>

          <button
            class="option-card"
            :disabled="appStore.isProcessing"
            @click="convertAllToHtml"
          >
            <h3>PDF to HTML</h3>
            <p>Convert PDFs to HTML format</p>
          </button>
        </div>
      </div>

      <div v-if="appStore.error" class="error-message">
        {{ appStore.error }}
      </div>

      <div v-if="appStore.isProcessing" class="processing-overlay">
        <div class="processing-content">
          <div class="spinner"></div>
          <p>Verarbeite {{ currentFileIndex + 1 }} von {{ appStore.currentFiles.length }} Dateien...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@shared/stores/app"
import FileUpload from "@/components/common/FileUpload.vue"
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'
import { ref } from 'vue'

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

const appStore = useAppStore()
const useZip = ref(true)
const imageFormat = ref('png')
const currentFileIndex = ref(0)

function handleFilesSelected(files: File[]) {
  console.log('[PDF Converter] Files selected:', files.length, 'files')
  appStore.setCurrentFiles(files)
}

function handleError(message: string) {
  console.error('[PDF Converter] Error:', message)
  appStore.setError(message)
}

async function convertAllToImage() {
  if (appStore.currentFiles.length === 0) return

  try {
    console.log('[PDF Converter] Starting batch PDF to Image conversion...')
    appStore.setProcessing(true)
    appStore.setError(null)

    const zip = new JSZip()
    let hasProcessedFiles = false

    for (let fileIndex = 0; fileIndex < appStore.currentFiles.length; fileIndex++) {
      currentFileIndex.value = fileIndex
      const file = appStore.currentFiles[fileIndex]
      console.log(`[PDF Converter] Processing file ${fileIndex + 1}/${appStore.currentFiles.length}: ${file.name}`)

      // Load the PDF file
      console.log('[PDF Converter] Loading PDF file...')
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      console.log('[PDF Converter] PDF loaded, pages:', pdf.numPages)

      // Convert each page to image
      console.log('[PDF Converter] Converting pages to images...')
      
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`[PDF Converter] Converting page ${i}/${pdf.numPages}...`)
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 })

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Could not get canvas context')
        
        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else throw new Error('Could not create image blob')
          }, `image/${imageFormat.value}`)
        })

        if (useZip.value) {
          // Add to zip with file name prefix
          const fileName = `${file.name.split('.')[0]}_page_${i}.${imageFormat.value}`
          zip.file(fileName, blob)
        } else {
          // Download individual file
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${file.name.split('.')[0]}_page_${i}.${imageFormat.value}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      }
      hasProcessedFiles = true
    }

    if (useZip.value && hasProcessedFiles) {
      console.log('[PDF Converter] Creating zip file...')
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      console.log('[PDF Converter] Zip file size:', (zipBlob.size / 1024 / 1024).toFixed(2) + 'MB')

      // Download the zip file
      console.log('[PDF Converter] Starting download...')
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pdf_images.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log('[PDF Converter] Download completed')
    }

  } catch (error) {
    console.error('[PDF Converter] Conversion failed:', error)
    appStore.setError(error instanceof Error ? error.message : 'Conversion failed')
  } finally {
    appStore.setProcessing(false)
    currentFileIndex.value = 0
  }
}

async function convertAllToText() {
  if (appStore.currentFiles.length === 0) return

  try {
    console.log('[PDF Converter] Starting batch PDF to Text conversion...')
    appStore.setProcessing(true)
    appStore.setError(null)

    const zip = new JSZip()
    let hasProcessedFiles = false

    for (let fileIndex = 0; fileIndex < appStore.currentFiles.length; fileIndex++) {
      currentFileIndex.value = fileIndex
      const file = appStore.currentFiles[fileIndex]
      console.log(`[PDF Converter] Processing file ${fileIndex + 1}/${appStore.currentFiles.length}: ${file.name}`)

      // Load the PDF file
      console.log('[PDF Converter] Loading PDF file...')
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      console.log('[PDF Converter] PDF loaded, pages:', pdf.numPages)

      // Extract text from each page
      console.log('[PDF Converter] Extracting text from pages...')
      let text = `=== ${file.name} ===\n\n`
      
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`[PDF Converter] Extracting text from page ${i}/${pdf.numPages}...`)
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ')
        text += `Page ${i}\n${pageText}\n\n`
      }

      if (appStore.currentFiles.length === 1) {
        // Single file - download directly
        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${file.name.split('.')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // Multiple files - add to zip
        zip.file(`${file.name.split('.')[0]}.txt`, text)
      }
      hasProcessedFiles = true
    }

    if (appStore.currentFiles.length > 1 && hasProcessedFiles) {
      console.log('[PDF Converter] Creating zip file...')
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      console.log('[PDF Converter] Zip file size:', (zipBlob.size / 1024 / 1024).toFixed(2) + 'MB')

      // Download the zip file
      console.log('[PDF Converter] Starting download...')
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pdf_texts.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log('[PDF Converter] Download completed')
    }

  } catch (error) {
    console.error('[PDF Converter] Text extraction failed:', error)
    appStore.setError(error instanceof Error ? error.message : 'Text extraction failed')
  } finally {
    appStore.setProcessing(false)
    currentFileIndex.value = 0
  }
}

async function convertAllToHtml() {
  if (appStore.currentFiles.length === 0) return

  try {
    console.log('[PDF Converter] Starting batch PDF to HTML conversion...')
    appStore.setProcessing(true)
    appStore.setError(null)

    const zip = new JSZip()
    let hasProcessedFiles = false

    for (let fileIndex = 0; fileIndex < appStore.currentFiles.length; fileIndex++) {
      currentFileIndex.value = fileIndex
      const file = appStore.currentFiles[fileIndex]
      console.log(`[PDF Converter] Processing file ${fileIndex + 1}/${appStore.currentFiles.length}: ${file.name}`)

      // Load the PDF file
      console.log('[PDF Converter] Loading PDF file...')
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      console.log('[PDF Converter] PDF loaded, pages:', pdf.numPages)

      // Convert each page to HTML
      console.log('[PDF Converter] Converting pages to HTML...')
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${file.name}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2rem; }
            .page { margin-bottom: 2rem; padding: 1rem; border: 1px solid #ddd; }
            .page-number { color: #666; font-size: 0.8rem; }
          </style>
        </head>
        <body>
      `
      
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`[PDF Converter] Converting page ${i}/${pdf.numPages} to HTML...`)
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        
        html += `<div class="page">`
        html += `<div class="page-number">Page ${i}</div>`
        
        const textContent = content.items
          .map((item: any) => {
            const style = item.transform ? `style="position: absolute; left: ${item.transform[4]}px; top: ${item.transform[5]}px;"` : ''
            return `<span ${style}>${item.str}</span>`
          })
          .join('')
        
        html += textContent
        html += `</div>`
      }

      html += `</body></html>`

      if (appStore.currentFiles.length === 1) {
        // Single file - download directly
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${file.name.split('.')[0]}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // Multiple files - add to zip
        zip.file(`${file.name.split('.')[0]}.html`, html)
      }
      hasProcessedFiles = true
    }

    if (appStore.currentFiles.length > 1 && hasProcessedFiles) {
      console.log('[PDF Converter] Creating zip file...')
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      console.log('[PDF Converter] Zip file size:', (zipBlob.size / 1024 / 1024).toFixed(2) + 'MB')

      // Download the zip file
      console.log('[PDF Converter] Starting download...')
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pdf_htmls.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log('[PDF Converter] Download completed')
    }

  } catch (error) {
    console.error('[PDF Converter] HTML conversion failed:', error)
    appStore.setError(error instanceof Error ? error.message : 'HTML conversion failed')
  } finally {
    appStore.setProcessing(false)
    currentFileIndex.value = 0
  }
}
</script>

<style lang="scss" scoped>
.pdf-converter {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #2c3e50;
  }
}

.converter-content {
  position: relative;
}

.conversion-options {
  margin-top: 2rem;

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
  padding: 1rem;
}

.option-card {
  background: #fff;
  border: none;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    margin: 0;
    font-size: 0.875rem;
  }
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee;
  color: #dc3545;
  border-radius: 4px;
  text-align: center;
}

.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.processing-content {
  text-align: center;

  .spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 1rem;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #42b883;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    color: #2c3e50;
    font-size: 1.1rem;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.conversion-settings {
  margin-top: 1rem;
  padding-top: 1rem;
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
  margin-top: 1rem;
  width: 100%;
  padding: 0.5rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background: #3aa876;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style> 