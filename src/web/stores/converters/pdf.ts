import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { useQueueStore } from '@web/stores/queue'

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/proxy/unpkg/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs'
}

interface PdfState {
  selectedFiles: File[]
  useZip: boolean
  imageFormat: string
  error: string | null
  isProcessing: boolean
  loadingMessage: string
  loadingProgress: number
  currentFile: number
  totalFiles: number
}

export const usePdfStore = defineStore('pdf', {
  state: (): PdfState => ({
    selectedFiles: [],
    useZip: true,
    imageFormat: 'png',
    error: null,
    isProcessing: false,
    loadingMessage: '',
    loadingProgress: 0,
    currentFile: 0,
    totalFiles: 0
  }),

  actions: {
    async handleFilesSelected(files: File[]) {
      this.error = null
      this.selectedFiles = []

      this.isProcessing = true
      this.loadingMessage = 'Validating PDF files...'
      this.loadingProgress = 0
      this.totalFiles = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        this.currentFile = i + 1
        this.loadingProgress = Math.round(((i + 1) / files.length) * 100)
        
        try {
          // Validate PDF file
          const arrayBuffer = await file.arrayBuffer()
          await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          this.selectedFiles.push(file)
        } catch (err) {
          this.error = `Invalid PDF file: ${file.name}`
          console.error('[PDF Converter] Invalid PDF file:', err)
          this.isProcessing = false
          return
        }
      }

      this.isProcessing = false
      this.loadingMessage = ''
      this.loadingProgress = 0
    },

    removeFile(fileToRemove: File) {
      this.selectedFiles = this.selectedFiles.filter(file => file !== fileToRemove)
    },

    async startConversion(type: 'image' | 'text' | 'html') {
      this.error = null
      this.isProcessing = true
      this.loadingMessage = `Converting PDFs to ${type}...`
      this.loadingProgress = 0
      this.totalFiles = this.selectedFiles.length
      
      try {
        if (this.selectedFiles.length === 0) return

        console.log(`[PDF Store] 🚀 Starting ${type} conversion for ${this.selectedFiles.length} immediate files`)

        // 🎯 WICHTIG: Convert immediate files first - CONSISTENT NAMING!
        if (this.selectedFiles.length === 1) {
          // Single file - direct download
          switch (type) {
            case 'image':
              await this.convertToImages()
              break
            case 'text':
              await this.convertToText()
              break
            case 'html':
              await this.convertToHtml()
              break
          }
        } else {
          // Multiple files - create bulk ZIP with CONSISTENT naming
          await this.convertMultipleFiles(type)
        }

        // Clear immediate files after conversion
        this.selectedFiles = []

        // 🎯 WICHTIG: Jetzt Queue automatisch starten!
        const queueStore = useQueueStore()
        if (queueStore.pendingFiles.length > 0) {
          console.log(`[PDF Store] 🔄 Auto-starting queue processing for ${queueStore.pendingFiles.length} queued files`)
          
          // Update queue options with current settings
          queueStore.updateQueueOptions('pdf', {
            format: type,
            imageFormat: this.imageFormat,
            useZip: this.useZip
          })
          
          // Start queue processing
          await queueStore.startProcessing()
        }

      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Conversion failed'
        console.error('Conversion error:', err)
      } finally {
        this.isProcessing = false
        this.loadingMessage = ''
        this.loadingProgress = 0
      }
    },

    // 🎯 NEW: Convert multiple immediate files as bulk - CONSISTENT NAMING!
    async convertMultipleFiles(type: 'image' | 'text' | 'html') {
      console.log(`[PDF Store] 📦 Converting ${this.selectedFiles.length} immediate files as bulk`)
      
      const zip = new JSZip()
      let hasProcessedFiles = false

      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i]
        this.currentFile = i + 1
        this.loadingProgress = Math.round(((i + 1) / this.selectedFiles.length) * 100)
        this.loadingMessage = `Processing ${file.name}...`

        try {
          console.log(`[PDF Store] Processing immediate file: ${file.name}`)
          const arrayBuffer = await file.arrayBuffer()
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

          switch (type) {
            case 'image':
              await this.addImagesToZip(pdf, file, zip)
              break
            case 'text':
              await this.addTextToZip(pdf, file, zip)
              break
            case 'html':
              await this.addHtmlToZip(pdf, file, zip)
              break
          }
          hasProcessedFiles = true
        } catch (err) {
          console.error(`[PDF Store] Error processing immediate file ${file.name}:`, err)
        }
      }

      if (hasProcessedFiles) {
        this.loadingMessage = 'Creating download package...'
        console.log('[PDF Store] 📦 Creating immediate bulk ZIP...')
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        
        // 🎯 CONSISTENT NAMING - same as queue!
        const queueStore = useQueueStore()
        const packName = `Converted_Pack-${queueStore.bulkCounter}`
        queueStore.bulkCounter++ // Increment counter
        
        this.downloadBlob(zipBlob, `${packName}.zip`)
      }
    },

    async addImagesToZip(pdf: any, file: File, zip: JSZip) {
      for (let i = 1; i <= pdf.numPages; i++) {
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
          }, `image/${this.imageFormat}`)
        })

        const fileName = `${file.name.split('.')[0]}_page_${i}.${this.imageFormat}`
        zip.file(fileName, blob)
      }
    },

    async addTextToZip(pdf: any, file: File, zip: JSZip) {
      let text = `=== ${file.name} ===\n\n`
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ')
        text += `Page ${i}\n${pageText}\n\n`
      }

      zip.file(`${file.name.split('.')[0]}.txt`, text)
    },

    async addHtmlToZip(pdf: any, file: File, zip: JSZip) {
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
      zip.file(`${file.name.split('.')[0]}.html`, html)
    },

    async convertToImages() {
      try {
        console.log('[PDF Converter] Starting single PDF to Image conversion...')
        const file = this.selectedFiles[0]
        this.loadingMessage = `Converting ${file.name} to images...`
        
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        console.log('[PDF Converter] PDF loaded, pages:', pdf.numPages)

        const pageImages: Blob[] = []
        
        for (let i = 1; i <= pdf.numPages; i++) {
          this.loadingProgress = Math.round((i / pdf.numPages) * 100)
          this.loadingMessage = `Converting page ${i} of ${pdf.numPages}...`
          
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
            }, `image/${this.imageFormat}`)
          })

          pageImages.push(blob)
        }

        this.loadingMessage = 'Preparing download...'

        if (this.useZip || pageImages.length > 1) {
          const zip = new JSZip()
          pageImages.forEach((blob, index) => {
            const fileName = `${file.name.split('.')[0]}_page_${index + 1}.${this.imageFormat}`
            zip.file(fileName, blob)
          })
          const zipBlob = await zip.generateAsync({ type: 'blob' })
          this.downloadBlob(zipBlob, `${file.name.split('.')[0]}_images.zip`)
        } else {
          this.downloadBlob(pageImages[0], `${file.name.split('.')[0]}_page_1.${this.imageFormat}`)
        }

      } catch (error) {
        console.error('[PDF Converter] Conversion failed:', error)
        throw error
      }
    },

    async convertToText() {
      const file = this.selectedFiles[0]
      this.loadingMessage = `Extracting text from ${file.name}...`
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      let text = `=== ${file.name} ===\n\n`
      
      for (let i = 1; i <= pdf.numPages; i++) {
        this.loadingProgress = Math.round((i / pdf.numPages) * 100)
        this.loadingMessage = `Extracting text from page ${i} of ${pdf.numPages}...`
        
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ')
        text += `Page ${i}\n${pageText}\n\n`
      }

      this.downloadBlob(new Blob([text], { type: 'text/plain' }), `${file.name.split('.')[0]}.txt`)
    },

    async convertToHtml() {
      const file = this.selectedFiles[0]
      this.loadingMessage = `Converting ${file.name} to HTML...`
      
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
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
        this.loadingProgress = Math.round((i / pdf.numPages) * 100)
        this.loadingMessage = `Converting page ${i} of ${pdf.numPages} to HTML...`
        
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
      this.downloadBlob(new Blob([html], { type: 'text/html' }), `${file.name.split('.')[0]}.html`)
    },

    downloadBlob(blob: Blob, filename: string) {
      console.log(`[PDF Store] 📥 Downloading: ${filename}`)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }
})