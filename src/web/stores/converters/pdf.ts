import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
}

interface PdfState {
  selectedFiles: File[]
  useZip: boolean
  imageFormat: string
  error: string | null
}

export const usePdfStore = defineStore('pdf', {
  state: (): PdfState => ({
    selectedFiles: [],
    useZip: true,
    imageFormat: 'png',
    error: null
  }),

  actions: {
    async handleFilesSelected(files: File[]) {
      this.error = null
      this.selectedFiles = []

      for (const file of files) {
        try {
          // Validate PDF file
          const arrayBuffer = await file.arrayBuffer()
          await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          this.selectedFiles.push(file)
        } catch (err) {
          this.error = `Invalid PDF file: ${file.name}`
          console.error('[PDF Converter] Invalid PDF file:', err)
          return
        }
      }
    },

    removeFile(fileToRemove: File) {
      this.selectedFiles = this.selectedFiles.filter(file => file !== fileToRemove)
    },

    async startConversion(type: 'image' | 'text' | 'html') {
      this.error = null
      
      try {
        if (this.selectedFiles.length === 0) return

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
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Conversion failed'
        console.error('Conversion error:', err)
      }
    },

    async convertToImages() {
      try {
        console.log('[PDF Converter] Starting batch PDF to Image conversion...')
        const zip = new JSZip()
        let hasProcessedFiles = false

        for (const file of this.selectedFiles) {
          console.log(`[PDF Converter] Processing file: ${file.name}`)

          try {
            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
            console.log('[PDF Converter] PDF loaded, pages:', pdf.numPages)

            const pageImages: Blob[] = []
            
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
                }, `image/${this.imageFormat}`)
              })

              pageImages.push(blob)
            }

            if (this.useZip) {
              pageImages.forEach((blob, index) => {
                const fileName = `${file.name.split('.')[0]}_page_${index + 1}.${this.imageFormat}`
                zip.file(fileName, blob)
              })
            } else {
              pageImages.forEach((blob, index) => {
                this.downloadBlob(blob, `${file.name.split('.')[0]}_page_${index + 1}.${this.imageFormat}`)
              })
            }
            hasProcessedFiles = true
          } catch (err) {
            console.error(`[PDF Converter] Error processing ${file.name}:`, err)
          }
        }

        if (this.useZip && hasProcessedFiles) {
          console.log('[PDF Converter] Creating zip file...')
          const zipBlob = await zip.generateAsync({ type: 'blob' })
          this.downloadBlob(zipBlob, 'pdf_images.zip')
        }

      } catch (error) {
        console.error('[PDF Converter] Conversion failed:', error)
        throw error
      }
    },

    async convertToText() {
      if (this.selectedFiles.length === 0) return

      try {
        console.log('[PDF Converter] Starting batch PDF to Text conversion...')
        const zip = new JSZip()
        let hasProcessedFiles = false

        for (const file of this.selectedFiles) {
          console.log(`[PDF Converter] Processing file: ${file.name}`)

          try {
            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
            console.log('[PDF Converter] PDF loaded, pages:', pdf.numPages)

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

            if (this.selectedFiles.length === 1) {
              this.downloadBlob(new Blob([text], { type: 'text/plain' }), `${file.name.split('.')[0]}.txt`)
            } else {
              zip.file(`${file.name.split('.')[0]}.txt`, text)
            }
            hasProcessedFiles = true
          } catch (err) {
            console.error(`[PDF Converter] Error extracting text from ${file.name}:`, err)
          }
        }

        if (this.selectedFiles.length > 1 && hasProcessedFiles) {
          console.log('[PDF Converter] Creating zip file...')
          const zipBlob = await zip.generateAsync({ type: 'blob' })
          this.downloadBlob(zipBlob, 'pdf_texts.zip')
        }

      } catch (error) {
        console.error('[PDF Converter] Text extraction failed:', error)
        throw error
      }
    },

    async convertToHtml() {
      if (this.selectedFiles.length === 0) return

      try {
        console.log('[PDF Converter] Starting batch PDF to HTML conversion...')
        const zip = new JSZip()
        let hasProcessedFiles = false

        for (const file of this.selectedFiles) {
          console.log(`[PDF Converter] Processing file: ${file.name}`)

          try {
            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
            console.log('[PDF Converter] PDF loaded, pages:', pdf.numPages)

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

            if (this.selectedFiles.length === 1) {
              this.downloadBlob(new Blob([html], { type: 'text/html' }), `${file.name.split('.')[0]}.html`)
            } else {
              zip.file(`${file.name.split('.')[0]}.html`, html)
            }
            hasProcessedFiles = true
          } catch (err) {
            console.error(`[PDF Converter] Error converting ${file.name} to HTML:`, err)
          }
        }

        if (this.selectedFiles.length > 1 && hasProcessedFiles) {
          console.log('[PDF Converter] Creating zip file...')
          const zipBlob = await zip.generateAsync({ type: 'blob' })
          this.downloadBlob(zipBlob, 'pdf_htmls.zip')
        }

      } catch (error) {
        console.error('[PDF Converter] HTML conversion failed:', error)
        throw error
      }
    },

    downloadBlob(blob: Blob, filename: string) {
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