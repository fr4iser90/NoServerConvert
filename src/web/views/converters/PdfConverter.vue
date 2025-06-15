<template>
  <div class="converter-layout">
    <div class="converter-main">
      <h1>PDF Converter</h1>
      
      <div class="upload-section">
        <FileUpload
          accept=".pdf"
          hint="Maximal 10 Dateien, je 100MB"
          :max-size="100 * 1024 * 1024"
          :multiple="true"
          :max-files="10"
          @files-selected="handleFilesSelected"
        />

        <div v-if="selectedFiles.length > 0" class="file-list">
          <h3>Ausgewählte Dateien:</h3>
          <ul>
            <li v-for="file in selectedFiles" :key="file.name" class="file-item">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">({{ formatFileSize(file.size) }})</span>
              <button 
                class="remove-file" 
                @click="removeFile(file)"
                title="Datei entfernen"
              >
                ×
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="conversion-options">
        <h2>Conversion Options</h2>
        
        <div class="options-grid">
          <div class="option-card">
            <h3>PDF to Image</h3>
            <p>Convert PDF pages to images</p>
            <div class="conversion-settings">
              <div class="setting-group">
                <label>
                  <input type="checkbox" v-model="useZip" />
                  Package all images in ZIP
                </label>
              </div>
              <div class="setting-group">
                <label>Image Format:</label>
                <select v-model="imageFormat">
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>
              </div>
            </div>
            <button
              class="convert-button"
              :disabled="!selectedFiles.length"
              @click="startConversion('image')"
            >
              Convert to Images
            </button>
          </div>

          <div class="option-card">
            <h3>PDF to Text</h3>
            <p>Extract text from PDFs</p>
            <button
              class="convert-button"
              :disabled="!selectedFiles.length"
              @click="startConversion('text')"
            >
              Extract Text
            </button>
          </div>

          <div class="option-card">
            <h3>PDF to HTML</h3>
            <p>Convert PDFs to HTML format</p>
            <button
              class="convert-button"
              :disabled="!selectedFiles.length"
              @click="startConversion('html')"
            >
              Convert to HTML
            </button>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FileUpload from '@web/components/common/FileUpload.vue'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'
import { ref } from 'vue'

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

const selectedFiles = ref<File[]>([])
const useZip = ref(true)
const imageFormat = ref('png')
const error = ref<string | null>(null)

function handleFilesSelected(files: File[]) {
  selectedFiles.value = files
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function removeFile(fileToRemove: File) {
  selectedFiles.value = selectedFiles.value.filter(file => file !== fileToRemove)
}

async function startConversion(type: 'image' | 'text' | 'html') {
  error.value = null
  
  try {
    if (selectedFiles.value.length === 0) return

    switch (type) {
      case 'image':
        await convertToImages(selectedFiles.value)
        break
      case 'text':
        await convertToText(selectedFiles.value)
        break
      case 'html':
        await convertToHtml(selectedFiles.value)
        break
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Conversion failed'
    console.error('Conversion error:', err)
  }
}

async function convertToImages(files: File[]) {
  try {
    console.log('[PDF Converter] Starting batch PDF to Image conversion...')
    const zip = new JSZip()
    let hasProcessedFiles = false

    for (const file of files) {
      console.log(`[PDF Converter] Processing file: ${file.name}`)

      try {
        // Load the PDF file
        console.log('[PDF Converter] Loading PDF file...')
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        console.log('[PDF Converter] PDF loaded, pages:', pdf.numPages)

        const pageImages: Blob[] = []
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

          pageImages.push(blob)
        }

        if (useZip.value) {
          // Add all images to zip
          pageImages.forEach((blob, index) => {
            const fileName = `${file.name.split('.')[0]}_page_${index + 1}.${imageFormat.value}`
            zip.file(fileName, blob)
          })
        } else {
          // Download individual files
          pageImages.forEach((blob, index) => {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${file.name.split('.')[0]}_page_${index + 1}.${imageFormat.value}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          })
        }
        hasProcessedFiles = true
      } catch (err) {
        console.error(`[PDF Converter] Error processing ${file.name}:`, err)
      }
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
    throw error
  }
}

async function convertToText(files: File[]) {
  if (files.length === 0) return

  try {
    console.log('[PDF Converter] Starting batch PDF to Text conversion...')

    const zip = new JSZip()
    let hasProcessedFiles = false

    for (const file of files) {
      console.log(`[PDF Converter] Processing file: ${file.name}`)

      try {
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

        if (files.length === 1) {
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
      } catch (err) {
        console.error(`[PDF Converter] Error extracting text from ${file.name}:`, err)
      }
    }

    if (files.length > 1 && hasProcessedFiles) {
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
    throw error
  }
}

async function convertToHtml(files: File[]) {
  if (files.length === 0) return

  try {
    console.log('[PDF Converter] Starting batch PDF to HTML conversion...')

    const zip = new JSZip()
    let hasProcessedFiles = false

    for (const file of files) {
      console.log(`[PDF Converter] Processing file: ${file.name}`)

      try {
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

        if (files.length === 1) {
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
      } catch (err) {
        console.error(`[PDF Converter] Error converting ${file.name} to HTML:`, err)
      }
    }

    if (files.length > 1 && hasProcessedFiles) {
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
    throw error
  }
}
</script>

<style lang="scss" scoped>
.converter-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 140px); // Account for nav and footer
}

.converter-main {
  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #2c3e50;
  }
}

.upload-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 2rem;
}

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

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee;
  color: #dc3545;
  border-radius: 4px;
  text-align: center;
}

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