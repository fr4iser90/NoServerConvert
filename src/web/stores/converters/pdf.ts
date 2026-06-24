import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { useQueueStore } from '@web/stores/queue'

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/proxy/unpkg/pdfjs-dist@6.0.227/build/pdf.worker.min.mjs'
}

type PdfConversionType = 'image' | 'text' | 'html' | 'compress'
export type PdfCompressionPreset = 'high' | 'balanced' | 'small'

export const PDF_COMPRESSION_PRESETS: Record<PdfCompressionPreset, {
  label: string
  description: string
  scale: number
  jpegQuality: number
}> = {
  high: {
    label: 'High Quality',
    description: 'Best readability, moderate file size reduction',
    scale: 1.5,
    jpegQuality: 0.85
  },
  balanced: {
    label: 'Balanced',
    description: 'Good default for mixed documents and scans',
    scale: 1.2,
    jpegQuality: 0.7
  },
  small: {
    label: 'Small File',
    description: 'Maximum reduction, visible quality loss possible',
    scale: 0.9,
    jpegQuality: 0.5
  }
}

type PdfCompressionCandidate = {
  label: string
  scale: number
  jpegQuality: number
}

const PDF_COMPRESSION_FALLBACKS: Record<PdfCompressionPreset, PdfCompressionPreset[]> = {
  high: ['high', 'balanced', 'small'],
  balanced: ['balanced', 'small'],
  small: ['small']
}

const PDF_TARGET_COMPRESSION_CANDIDATES: PdfCompressionCandidate[] = [
  { label: 'Target 45%', scale: 0.8, jpegQuality: 0.45 },
  { label: 'Target 40%', scale: 0.7, jpegQuality: 0.4 },
  { label: 'Target 35%', scale: 0.6, jpegQuality: 0.35 },
  { label: 'Target 30%', scale: 0.5, jpegQuality: 0.3 },
  { label: 'Target 25%', scale: 0.4, jpegQuality: 0.25 }
]

interface PdfState {
  selectedFiles: File[]
  useZip: boolean
  imageFormat: string
  compressionPreset: PdfCompressionPreset
  useQpdfOptimization: boolean
  useTargetSize: boolean
  targetSizeMb: number
  pageSelection: string
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
    compressionPreset: 'balanced',
    useQpdfOptimization: false,
    useTargetSize: false,
    targetSizeMb: 5,
    pageSelection: '',
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

    async startConversion(type: PdfConversionType) {
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
            case 'compress':
              await this.compressPdf()
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
            compressionPreset: this.compressionPreset,
            useQpdfOptimization: this.useQpdfOptimization,
            useTargetSize: this.useTargetSize,
            targetSizeMb: this.targetSizeMb,
            pageSelection: this.pageSelection,
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
    async convertMultipleFiles(type: PdfConversionType) {
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
            case 'compress':
              await this.addCompressedPdfToZip(file, zip)
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

    async addCompressedPdfToZip(file: File, zip: JSZip) {
      const blob = await this.createCompressedPdf(file)
      zip.file(`compressed_${file.name}`, blob)
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

    async compressPdf() {
      const file = this.selectedFiles[0]
      this.loadingMessage = `Compressing ${file.name}...`
      this.loadingProgress = 0

      const blob = await this.createCompressedPdf(file)
      this.downloadBlob(blob, `compressed_${file.name}`)
    },

    async createCompressedPdf(file: File) {
      const originalBytes = new Uint8Array(await file.arrayBuffer())
      const originalSize = originalBytes.byteLength
      const sourcePdf = await pdfjsLib.getDocument({ data: new Uint8Array(originalBytes) }).promise
      const selectedPages = this.parsePageSelection(this.pageSelection, sourcePdf.numPages)
      const targetSizeBytes = this.useTargetSize
        ? Math.max(1, this.targetSizeMb) * 1024 * 1024
        : undefined
      const candidates = this.getCompressionCandidates()
      const totalRenderSteps = candidates.length * selectedPages.size
      let completedRenderSteps = 0
      let bestBlob: Blob | null = null

      for (const candidate of candidates) {
        const candidateBlob = await this.createCompressedPdfCandidate({
          sourcePdf,
          originalBytes,
          selectedPages,
          candidate,
          onPageCompressed: (pageNumber) => {
            completedRenderSteps++
            this.loadingProgress = Math.round((completedRenderSteps / totalRenderSteps) * 90)
            this.loadingMessage = `Compressing with ${candidate.label}: page ${pageNumber} of ${sourcePdf.numPages}...`
          }
        })
        let optimizedCandidate = candidateBlob

        if (this.useQpdfOptimization) {
          this.loadingMessage = `Optimizing ${candidate.label} with qPDF WASM...`
          const { optimizePdfWithQpdf } = await import('@shared/converters/modules/document/pdf/qpdfOptimize')
          const qpdfBlob = await optimizePdfWithQpdf(candidateBlob)
          if (qpdfBlob.size < optimizedCandidate.size) {
            optimizedCandidate = qpdfBlob
          }
        }

        if (!bestBlob || optimizedCandidate.size < bestBlob.size) {
          bestBlob = optimizedCandidate
        }

        if (targetSizeBytes && optimizedCandidate.size <= targetSizeBytes && optimizedCandidate.size < originalSize) {
          return optimizedCandidate
        }
      }

      if (!bestBlob) {
        throw new Error('Compression failed: no PDF output was created.')
      }

      if (this.useQpdfOptimization) {
        this.loadingMessage = 'Optimizing PDF structure with qPDF WASM...'
        const { optimizePdfWithQpdf } = await import('@shared/converters/modules/document/pdf/qpdfOptimize')
        const optimizedOriginalBlob = await optimizePdfWithQpdf(originalBytes)
        if (optimizedOriginalBlob.size < bestBlob.size) {
          bestBlob = optimizedOriginalBlob
        }

        if (targetSizeBytes && bestBlob.size <= targetSizeBytes && bestBlob.size < originalSize) {
          return bestBlob
        }
      }

      if (targetSizeBytes && bestBlob.size > targetSizeBytes) {
        throw new Error(`Target size not reached: smallest result is ${this.formatFileSize(bestBlob.size)}, target is ${this.formatFileSize(targetSizeBytes)}. Try selecting fewer pages or accept stronger quality loss.`)
      }

      if (bestBlob.size >= originalSize) {
        throw new Error(`Compression skipped: this PDF is already smaller than the compressed result (${this.formatFileSize(originalSize)} original vs ${this.formatFileSize(bestBlob.size)} compressed). Try the "Small File" preset for scanned PDFs.`)
      }

      return bestBlob
    },

    async createCompressedPdfCandidate(options: {
      sourcePdf: any
      originalBytes: Uint8Array
      selectedPages: Set<number>
      candidate: PdfCompressionCandidate
      onPageCompressed: (pageNumber: number) => void
    }) {
      const outputPdf = await PDFDocument.create()
      const originalPdf = options.selectedPages.size < options.sourcePdf.numPages
        ? await PDFDocument.load(new Uint8Array(options.originalBytes))
        : null

      for (let i = 1; i <= options.sourcePdf.numPages; i++) {
        if (!options.selectedPages.has(i)) {
          if (!originalPdf) continue
          const [copiedPage] = await outputPdf.copyPages(originalPdf, [i - 1])
          outputPdf.addPage(copiedPage)
          continue
        }

        options.onPageCompressed(i)
        const page = await options.sourcePdf.getPage(i)
        const outputViewport = page.getViewport({ scale: 1 })
        const renderViewport = page.getViewport({ scale: options.candidate.scale })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Could not get canvas context')

        canvas.width = Math.ceil(renderViewport.width)
        canvas.height = Math.ceil(renderViewport.height)

        await page.render({
          canvasContext: context,
          viewport: renderViewport
        }).promise

        const imageBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else throw new Error('Could not create compressed page image')
          }, 'image/jpeg', options.candidate.jpegQuality)
        })

        const imageBytes = await imageBlob.arrayBuffer()
        const image = await outputPdf.embedJpg(imageBytes)
        const compressedPage = outputPdf.addPage([outputViewport.width, outputViewport.height])
        compressedPage.drawImage(image, {
          x: 0,
          y: 0,
          width: outputViewport.width,
          height: outputViewport.height
        })
      }

      const bytes = await outputPdf.save({
        useObjectStreams: true,
        addDefaultPage: false
      })
      const blobPart = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
      return new Blob([blobPart], { type: 'application/pdf' })
    },

    getCompressionCandidates(): PdfCompressionCandidate[] {
      const presetCandidates = PDF_COMPRESSION_FALLBACKS[this.compressionPreset].map((presetName) => ({
        label: PDF_COMPRESSION_PRESETS[presetName].label,
        scale: PDF_COMPRESSION_PRESETS[presetName].scale,
        jpegQuality: PDF_COMPRESSION_PRESETS[presetName].jpegQuality
      }))

      return this.useTargetSize
        ? [...presetCandidates, ...PDF_TARGET_COMPRESSION_CANDIDATES]
        : presetCandidates
    },

    parsePageSelection(selection: string, pageCount: number) {
      const selectedPages = new Set<number>()
      const trimmedSelection = selection.trim()

      if (!trimmedSelection) {
        for (let page = 1; page <= pageCount; page++) selectedPages.add(page)
        return selectedPages
      }

      for (const part of trimmedSelection.split(',')) {
        const trimmedPart = part.trim()
        if (!trimmedPart) continue

        const [startValue, endValue] = trimmedPart.split('-').map(value => Number.parseInt(value.trim(), 10))
        const start = Math.max(1, Math.min(pageCount, startValue))
        const end = Math.max(1, Math.min(pageCount, endValue || startValue))

        if (Number.isNaN(start) || Number.isNaN(end)) {
          throw new Error('Invalid page selection. Use formats like "1,3-5".')
        }

        for (let page = Math.min(start, end); page <= Math.max(start, end); page++) {
          selectedPages.add(page)
        }
      }

      if (selectedPages.size === 0) {
        throw new Error('Invalid page selection. Use formats like "1,3-5".')
      }

      return selectedPages
    },

    formatFileSize(bytes: number) {
      if (bytes === 0) return '0 B'
      const units = ['B', 'KB', 'MB', 'GB']
      const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
      return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
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