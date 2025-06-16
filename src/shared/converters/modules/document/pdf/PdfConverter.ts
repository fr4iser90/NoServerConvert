import { BaseConverter, type ConverterOptions, type ConversionResult } from '@shared/converters/core/base/BaseConverter'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'

export class PdfConverter extends BaseConverter {
  protected readonly supportedFormats = ['pdf']
  protected readonly maxFileSize = 100 * 1024 * 1024 // 100MB
  protected readonly maxFiles = 10

  constructor() {
    super()
    // Initialize PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  }

  async convert(file: File, options: ConverterOptions): Promise<ConversionResult> {
    try {
      this.validate(file)

      switch (options.format) {
        case 'image':
          return await this.convertToImages(file, options)
        case 'text':
          return await this.convertToText(file)
        case 'html':
          return await this.convertToHtml(file)
        default:
          throw new Error('Nicht unterstütztes Konvertierungsformat')
      }
    } catch (error) {
      return {
        blob: new Blob(),
        fileName: file.name,
        error: error instanceof Error ? error.message : 'Konvertierung fehlgeschlagen'
      }
    }
  }

  private async convertToImages(file: File, options: ConverterOptions): Promise<ConversionResult> {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const zip = new JSZip()
    const pageImages: Blob[] = []
    const imageFormat = options.imageFormat || 'png'

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
        }, `image/${imageFormat}`)
      })

      pageImages.push(blob)
    }

    if (options.useZip) {
      // Add all images to zip
      pageImages.forEach((blob, index) => {
        const fileName = `${file.name.split('.')[0]}_page_${index + 1}.${imageFormat}`
        zip.file(fileName, blob)
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      return {
        blob: zipBlob,
        fileName: 'pdf_images.zip'
      }
    } else {
      // Return first image if not zipping
      return {
        blob: pageImages[0],
        fileName: `${file.name.split('.')[0]}_page_1.${imageFormat}`
      }
    }
  }

  private async convertToText(file: File): Promise<ConversionResult> {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = `=== ${file.name} ===\n\n`
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ')
      text += `Page ${i}\n${pageText}\n\n`
    }

    const blob = new Blob([text], { type: 'text/plain' })
    return {
      blob,
      fileName: `${file.name.split('.')[0]}.txt`
    }
  }

  private async convertToHtml(file: File): Promise<ConversionResult> {
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

    const blob = new Blob([html], { type: 'text/html' })
    return {
      blob,
      fileName: `${file.name.split('.')[0]}.html`
    }
  }
} 